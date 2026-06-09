const pool = require('../db/db');

exports.notifyRequest = async (req, res) => {
    try {
        const { user_id, product_id, gram_id } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'User ID and Product ID are required'
            });
        }

        // Check if request already exists
        const checkQuery = `
            SELECT * FROM public.tbl_notify_requests 
            WHERE user_id = $1 AND product_id = $2 AND COALESCE(gram_id, 0) = COALESCE($3, 0) 
            AND status = '0'
        `;
        const checkResult = await pool.query(checkQuery, [user_id, product_id, gram_id]);

        if (checkResult.rowCount > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: 'Already registered for notification'
            });
        }

        // Insert notify request
        await pool.query(
            `INSERT INTO public.tbl_notify_requests (user_id, product_id, gram_id,status) VALUES ($1, $2, $3,$4)`,
            [user_id, product_id, gram_id, '0']
        );

        res.status(200).json({
            statusCode: 200,
            message: 'You will be notified when the product is back in stock'
        });
    } catch (error) {
        console.error("Error adding notify request:", error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
};



exports.getAllNotifyRequests = async (req, res) => {
    try {

        const query = `
            SELECT 
                 
                n.user_id,
                n.product_id,
                n.gram_id,
                n.status,
              

                u.first_name AS first_name,
                u.email AS user_email,
                u.phone_number AS phone_number,

                p.product_name,
               

                g.grams,
                g.price,
                g.stock
            FROM public.tbl_notify_requests n
            LEFT JOIN public.tbl_users u ON n.user_id = u.user_id
            LEFT JOIN public.tbl_product p ON n.product_id = p.product_id
            LEFT JOIN public.tbl_grams g ON n.gram_id = g.pricegrams_id
            
        `;

        const result = await pool.query(query);

        res.status(200).json({
            statusCode: 200,
            message: "All notification requests fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("Error in getAllNotifyRequests:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
};





exports.getUserNotifications = async (req, res) => {
    const { user_id } = req.body;

    try {
        const result = await pool.query(`
      SELECT 
       nr.notify_id,
        nr.product_id,
        nr.gram_id,
        p.product_name,
        g.grams,
        g.stock
      FROM tbl_notify_requests nr
      JOIN tbl_product p ON p.product_id = nr.product_id
      JOIN tbl_grams g ON g.pricegrams_id = nr.gram_id
      WHERE nr.user_id = $1 
      AND g.stock > 0
    `, [user_id]);

        if (result.rows.length > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Products available now",
                notifications: result.rows
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "No notifications yet",
            notifications: []
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
};



exports.updateAndDeleteNotify = async (req, res) => {
    let { notify_id } = req.body;

    if (!notify_id) {
        return res.status(401).json({
            statusCode: 401,
            message: 'Notify ID is required'
        });
    }

    // Ensure notify_id is number
    notify_id = Number(notify_id);
    if (isNaN(notify_id)) {
        return res.status(400).json({
            statusCode: 400,
            message: "notify_id must be a number"
        });
    }

    try {
        // 1️⃣ Update status to 1
        const updateResult = await pool.query(
            `UPDATE public.tbl_notify_requests 
             SET status = 1 
             WHERE notify_id = $1`,
            [notify_id]
        );

        if (updateResult.rowCount === 0) {
            return res.status(400).json({
                statusCode: 400,
                message: "Notify record not found"
            });
        }

        // 2️⃣ Delete record after update
        await pool.query(
            `DELETE FROM public.tbl_notify_requests 
             WHERE notify_id = $1 AND status = 1`,
            [notify_id]
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Notification updated successfully"
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
};
