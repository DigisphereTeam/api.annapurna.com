const pool = require('../db/db');
const sendErrorResponse = require('../utils/sendErrorResponse.js');

exports.addOrder = async (req, res) => {
  const { user_id, address, first_name, last_name, city, state, pincode, phonenumber, delivery_charges } = req.body;

  if (!user_id || !address) {
    return res.status(400).json({ error: 'User ID and address are required' });
  }

  try {
    // 1️⃣ Get all cart items
    const cartItemsResult = await pool.query(
      'SELECT * FROM public.tbl_cart WHERE user_id = $1',
      [user_id]
    );
    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;

    // 2️⃣ Check stock for each gram entry and calculate total
    for (let item of cartItems) {
      // Get stock and price from tbl_grams
      const gramsResult = await pool.query(
        'SELECT stock, price FROM public.tbl_grams WHERE pricegrams_id = $1',
        [item.pricegrams_id]
      );

      const gramsData = gramsResult.rows[0];

      if (!gramsData) {
        return res.status(400).json({ error: `Grams entry with ID ${item.pricegrams_id} not found` });
      }

      const stockValue = parseInt(gramsData.stock || 0);
      const priceValue = parseFloat(gramsData.price || 0);

      if (stockValue < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product ID ${item.product_id} (grams ID ${item.pricegrams_id})`
        });
      }

      totalAmount += priceValue * item.quantity;
    }

    // 3️⃣ Get new order number
    const lastOrderNumberResult = await pool.query(
      `SELECT order_number FROM public.tbl_order ORDER BY order_id DESC LIMIT 1`
    );

    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);

    const datePrefix = `AF_${day}_${month}_${year}`;

    const countResult = await pool.query(
      `
          SELECT COUNT(*) AS count
          FROM tbl_order
          WHERE order_number LIKE $1
          `,
      [`${datePrefix}_%`]
    );

    const count = Number(countResult.rows[0].count) + 1;
    const newOrderNumber = `${datePrefix}_${String(count).padStart(4, '0')}`;

    // 4️⃣ Insert into tbl_order
    const orderResult = await pool.query(
      `INSERT INTO public.tbl_order
      (order_number, user_id, first_name, last_name, address, city, state, pincode, phonenumber, delivery_charges, total_amount, order_status, order_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Pending',NOW()) RETURNING *`,
      [newOrderNumber, user_id, first_name, last_name, address, city, state, pincode, phonenumber, delivery_charges, totalAmount]
    );

    const order = orderResult.rows[0];

    // 5️⃣ Insert each item into tbl_order_items and reduce stock from tbl_grams
    for (let item of cartItems) {
      const gramsResult = await pool.query(
        'SELECT stock, price FROM public.tbl_grams WHERE pricegrams_id = $1',
        [item.pricegrams_id]
      );
      const gramsData = gramsResult.rows[0];

      const price = parseFloat(gramsData.price || 0);
      const currentStock = parseInt(gramsData.stock || 0);
      const newStock = currentStock - item.quantity;

      // Add order item
      await pool.query(
        `INSERT INTO public.tbl_order_items (order_id, product_id, pricegrams_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.order_id, item.product_id, item.pricegrams_id, item.quantity, price]
      );

      // Update stock in tbl_grams
      await pool.query(
        `UPDATE public.tbl_grams SET stock = $1 WHERE pricegrams_id = $2`,
        [newStock, item.pricegrams_id]
      );
    }

    // 6️⃣ Clear cart after order success
    await pool.query('DELETE FROM public.tbl_cart WHERE user_id = $1', [user_id]);

    res.status(200).json({
      statusCode: 200,
      message: 'Order placed successfully',
      order
    });

  } catch (error) {
    console.error('Error in addOrder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrderDetailsByUserId = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Fetch orders for the user
    const ordersResult = await pool.query(
      'SELECT * FROM public.tbl_order WHERE user_id = $1 ORDER BY order_date DESC',
      [user_id]
    );
    const orders = ordersResult.rows;

    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }

    // For each order, get order items details
    for (let order of orders) {
      const itemsResult = await pool.query(
        `SELECT 
                    oi.product_id,
                    p.product_name,
                    p.product_image,
                    oi.pricegrams_id,
                    g.grams,
                    g.price,
                    oi.quantity
                 FROM public.tbl_order_items oi
                 JOIN public.tbl_product p ON oi.product_id = p.product_id
                 JOIN public.tbl_grams g ON oi.pricegrams_id = g.pricegrams_id
                 WHERE oi.order_id = $1`,
        [order.order_id]
      );
      order.items = itemsResult.rows;
    }

    res.status(200).json({
      statusCode: 200,
      orders
    });

  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getorders = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
          o.order_id,
          o.order_number,
          u.first_name AS  first_name,
          u.last_name AS  last_name,
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
        ORDER BY 
          o.order_date DESC
      `);

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



exports.getOrderItems = async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) {
    return sendErrorResponse(res, 400, "Order id is required")
  }
  try {
    // Fetch order items
    const itemsResult = await pool.query(`
      SELECT 
        oi.order_items_id,
        oi.quantity,
        oi.price AS item_price,
        pg.grams,
        pg.price AS price_per_gram,
        p.product_name,
        p.product_image
      FROM 
        tbl_order_items oi
      JOIN 
        tbl_grams pg ON oi.pricegrams_id = pg.pricegrams_id
      JOIN 
        tbl_product p ON oi.product_id = p.product_id
      WHERE 
        oi.order_id = $1
      ORDER BY 
        oi.order_items_id ASC
    `, [order_id]);

    // If no items found
    if (itemsResult.rows.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: 'No items found for this order',
      });
    }

    // Fetch total amount
    const totalAmountResult = await pool.query(`
      SELECT total_amount 
      FROM tbl_order 
      WHERE order_id = $1
    `, [order_id]);

    const totalAmount = totalAmountResult.rows[0]?.total_amount || 0;

    // Send response
    res.status(200).json({
      statusCode: 200,
      message: 'Order items fetched successfully',
      data: {
        total_amount: totalAmount,
        items: itemsResult.rows
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message || 'Internal Server Error',
    });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id, order_status } = req.body;

    if (!order_id || !order_status) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Product ID and product_status are required'
      });
    }


    const updateStatusQuery = `
            UPDATE public.tbl_order
            SET order_status = $1 
            WHERE order_id = $2
            RETURNING order_id, order_status
        `;

    const updateResult = await pool.query(updateStatusQuery, [order_status, order_id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Order status updated successfully',
      product: updateResult.rows[0]
    });

  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error'
    });
  }
};



