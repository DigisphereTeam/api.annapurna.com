const pool = require('../db/db');

exports.getOrderStatusCounts = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE order_status = 'Pending') AS Pending,
          COUNT(*) FILTER (WHERE order_status = 'Confirmed') AS Confirmed,
          COUNT(*) FILTER (WHERE order_status = 'Delivered') AS Delivered,
          COUNT(*) FILTER (WHERE order_status = 'Shipped') AS Shipped
        FROM tbl_order
      `);
  
      res.status(200).json({
        statusCode: 200,
        message: 'Order status counts fetched successfully',
        data: result.rows[0],
      });
  
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error',
      });
    }
  };
  

 
  exports.getOrdersByStatus = async (req, res) => {
    const { status } = req.body;
  
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
  
  