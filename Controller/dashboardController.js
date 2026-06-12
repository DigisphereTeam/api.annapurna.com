const pool = require('../db/db');
const sendErroResponse = require('../utils/sendErrorResponse.js');
const sendResponse = require('../utils/sendResponse.js');

exports.getOrderStatusCounts = async (req, res) => {
  try {
    const [ordersStatistics, couponsStatistics, categoryStatistics, productsStatistics] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE order_status = 'Pending') AS pending_count,
          COUNT(*) FILTER (WHERE order_status = 'Confirmed') AS confirmed_count,
          COUNT(*) FILTER (WHERE order_status = 'Delivered') AS delivered_count,
          COUNT(*) FILTER (WHERE order_status = 'Shipped') AS shipped_count
        FROM tbl_order
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total_count,
          COUNT(*) AS  users_usage_count,
          COUNT(*) FILTER (WHERE LOWER(status) = 'active') AS active_count,
          COUNT(*) FILTER (WHERE LOWER(status) = 'inactive') AS inactive_count
        FROM tbl_coupons
      `),

      pool.query(`
        SELECT
          COUNT(*) AS category_count
        FROM tbl_category
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total_count,
          COUNT(*) AS sales_count,
          COUNT(*) FILTER (WHERE LOWER(product_status) = 'hidden') AS hidden_count
        FROM tbl_product
      `),
    ]);

    return sendResponse(res, 200, "Dashbaord Statistics fetched successfully", {
      products: {
        ...productsStatistics.rows[0],
        ...categoryStatistics.rows[0],
      },
      orders: ordersStatistics.rows[0],
      coupons: couponsStatistics.rows[0],
      payments: {
        failed_transactions_amount: 0,
        total_settled_amount: 0,
        total_successful_payments_amount: 0,
        pending_settlements_amount: 0
      }
    }
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};



exports.getOrdersByStatus = async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return sendErroResponse(res, 400, "Status is required");
  }

  try {
    const result = await pool.query(`
        SELECT 
          o.order_id,
          o.order_number,
          u.first_name AS first_name,
          u.last_name AS last_name,
          o.address,
          o.city,
          o.state,
          o.pincode,
          o.phonenumber,
          o.total_amount,
          o.order_status,
          o.order_date
        FROM 
          tbl_order o
        JOIN 
          tbl_users u 
        ON 
          o.user_id = u.user_id
        ${status ? `WHERE o.order_status = $1` : ''}
        ORDER BY 
          o.order_date DESC
      `, status ? [status] : []);

    res.status(200).json({
      statusCode: 200,
      message: 'Orders fetched successfully',
      data: result.rows,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
};

