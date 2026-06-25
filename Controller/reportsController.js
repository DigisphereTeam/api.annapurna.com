const pool = require("../db/db.js");
const sendResponse = require("../utils/sendResponse.js");

function validateAdminReportFilters({ from_date, to_date, user_id, product_id }) {

    if (from_date && isNaN(Date.parse(from_date))) {
        return "Invalid from_date.";
    }

    if (to_date && isNaN(Date.parse(to_date))) {
        return "Invalid to_date.";
    }

    if ((from_date && !to_date) || (!from_date && to_date)) {
        return "Both from_date and to_date are required.";
    }

    if (from_date && to_date && new Date(from_date) > new Date(to_date)) {
        return "from_date cannot be greater than to_date.";
    }

    if (user_id && (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0)) {
        return "Invalid user_id.";
    }

    if (product_id && (!Number.isInteger(Number(product_id)) || Number(product_id) <= 0)) {
        return "Invalid product_id.";
    }

    return null;
}

async function getAdminReports(req, res) {
    const { from_date, to_date, user_id, product_id } = req.query;

    const validationError = validateAdminReportFilters({
        from_date,
        to_date,
        user_id,
        product_id
    });

    if (validationError) {
        return res.status(400).json({
            statusCode: 400,
            message: validationError
        });
    }

    try {
        let query = `
            SELECT
                COUNT(DISTINCT o.order_id) AS total_orders,
                COALESCE(SUM(o.total_amount::numeric), 0) AS total_sales,
                COUNT(*) FILTER (WHERE LOWER(order_status) = 'pending') AS pending_orders,
                COUNT(*) FILTER (WHERE LOWER(order_status) = 'shipped') AS shipped_orders,
                COUNT(*) FILTER (WHERE LOWER(order_status) = 'delivered') AS delivered_orders
            FROM tbl_order o
        `;

        const values = [];
        let paramIndex = 1;

        if (product_id) {
            query += `
                INNER JOIN tbl_order_items oi
                ON oi.order_id = o.order_id
            `;
        }

        query += ` WHERE 1 = 1`;

        if (user_id) {
            query += ` AND o.user_id = $${paramIndex++}`;
            values.push(user_id);
        }

        if (product_id) {
            query += ` AND oi.product_id = $${paramIndex++}`;
            values.push(product_id);
        }

        if (from_date && to_date) {
            query += ` AND o.order_date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
            values.push(from_date, to_date);
        }

        const reportResult = await pool.query(query, values);

        const data = {
            total_orders: Number(reportResult.rows[0].total_orders),
            total_sales: Number(reportResult.rows[0].total_sales),
            pending_orders: Number(reportResult.rows[0].pending_orders),
            shipped_orders: Number(reportResult.rows[0].shipped_orders),
            delivered_orders: Number(reportResult.rows[0].delivered_orders)
        };;

        return sendResponse(res, 200, "Reports fetched successfully", data);
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message || "Internal Server Error"
        });
    }
}

async function getAdminReportData(req, res) {
    // page = 1, limit = 10
    const { from_date, to_date, user_id, product_id } = req.query;

    const validationError = validateAdminReportFilters({ from_date, to_date, user_id, product_id });

    if (validationError) {
        return sendResponse(res, 400, validationError);
    }

    try {
        // const currentPage = Number(page);
        // const pageSize = Number(limit);
        // const offset = (currentPage - 1) * pageSize;

        let query = `
            SELECT
                o.order_id,
                o.order_date,
                o.order_status,
                o.order_number,
                o.total_amount::numeric AS total_amount,

                json_build_object(
                    'user_id', u.user_id,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'email', u.email
                ) AS user,

                json_agg(
                    json_build_object(
                        'product_id', p.product_id,
                        'product_name', p.product_name,
                        'description',p.description,
                        'category',
                        json_build_object(
                            'category_id', c.category_id,
                            'category_name', c.category_name
                        ),

                        'quantity', oi.quantity,
                        'price', oi.price::numeric,

                        'pricegrams',
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'grams', g.grams,
                                    'price', g.price::numeric,
                                    'stock', g.stock
                                )
                                ORDER BY g.grams
                            )
                            FROM tbl_grams g
                            WHERE g.product_id = p.product_id
                        )
                    )
                ) AS products

            FROM tbl_order o

            INNER JOIN tbl_users u
                ON u.user_id = o.user_id

            INNER JOIN tbl_order_items oi
                ON oi.order_id = o.order_id

            INNER JOIN tbl_product p
                ON p.product_id = oi.product_id

            INNER JOIN tbl_category c
                ON c.category_id = p.category_id

            WHERE 1 = 1
        `;

        // let countQuery = `
        //     SELECT COUNT(DISTINCT o.order_id) AS total_records
        //     FROM tbl_order o
        //     INNER JOIN tbl_users u
        //         ON u.user_id = o.user_id
        //     INNER JOIN tbl_order_items oi
        //         ON oi.order_id = o.order_id
        //     INNER JOIN tbl_product p
        //         ON p.product_id = oi.product_id
        //     INNER JOIN tbl_category c
        //         ON c.category_id = p.category_id
        //     WHERE 1 = 1
        // `;

        const values = [];
        let paramIndex = 1;

        if (user_id) {
            query += ` AND o.user_id = $${paramIndex}`;
            // countQuery += ` AND o.user_id = $${paramIndex}`;
            values.push(user_id);
            paramIndex++;
        }

        if (product_id) {
            query += ` AND p.product_id = $${paramIndex}`;
            // countQuery += ` AND p.product_id = $${paramIndex}`;
            values.push(product_id);
            paramIndex++;
        }

        if (from_date && to_date) {
            query += ` AND o.order_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            // countQuery += ` AND o.order_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            values.push(from_date, to_date);
            paramIndex += 2;
        }

        query += `
            GROUP BY
                o.order_id,
                o.order_date,
                o.order_status,
                o.order_number,
                o.total_amount,
                u.user_id,
                u.first_name,
                u.last_name,
                u.email
        `;

        query += `
            ORDER BY o.order_id DESC
        `;

        // LIMIT $${paramIndex}
        // OFFSET $${paramIndex + 1}

        const queryValues = [...values];

        // pageSize, offset

        // const [dataResult, countResult] = await Promise.all([
        //     pool.query(query, queryValues),
        //     pool.query(countQuery, values)
        // ]);

        const dataResult = await pool.query(query ,  queryValues)

        // const totalRecords = Number(countResult.rows[0].total_records);
        // const totalPages = Math.ceil(totalRecords / pageSize);
        // pagination_info: {
        //         current_page: currentPage,
        //         page_size: pageSize,
        //         total_records: totalRecords,
        //         total_pages: totalPages,
        //         next_page: currentPage < totalPages ? currentPage + 1 : null,
        //         previous_page: currentPage > 1 ? currentPage - 1 : null
        //     },

        return sendResponse(res, 200, "Report data retrieved successfully", dataResult.rows);
    } catch (error) {
        return sendResponse(
            res,
            500,
            error.message || "Internal Server Error"
        );
    }
}

module.exports = {
    getAdminReports,
    getAdminReportData
};