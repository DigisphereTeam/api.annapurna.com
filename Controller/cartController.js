const pool = require('../db/db');

exports.addCart = async (req, res) => {
    const { product_id, pricegrams_id, quantity, user_id, price } = req.body;

    try {
        if (
            !product_id || isNaN(Number(product_id)) ||
            !pricegrams_id || isNaN(Number(pricegrams_id)) ||
            !quantity || isNaN(Number(quantity)) ||
            !user_id || isNaN(Number(user_id))
        ) {
            return res.status(400).json({ error: 'Invalid or missing product, grams, quantity, or user ID' });
        }


        // Check if the grams option already exists in cart
        const existcart = await pool.query(
            'SELECT * FROM public.tbl_cart WHERE pricegrams_id = $1 AND user_id = $2',
            [pricegrams_id, user_id]
        );
        if (existcart.rows.length > 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'This grams option is already added to cart for the user'
            });
        }

        // Fetch grams and product_id from tbl_grams
        const gramResult = await pool.query(
            'SELECT grams, product_id FROM public.tbl_grams WHERE pricegrams_id = $1',
            [pricegrams_id]
        );

        if (gramResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid grams option selected' });
        }

        const gramsPerUnit = parseFloat(gramResult.rows[0].grams);
        const totalGramsRequested = gramsPerUnit * parseInt(quantity);

        // Fetch product stock from tbl_product
        const productResult = await pool.query(
            'SELECT stock FROM public.tbl_product WHERE product_id = $1',
            [product_id]
        );

        if (productResult.rows.length === 0) {
            return res.status(400).json({ error: 'Product not found' });
        }

        const stock = parseFloat(productResult.rows[0].stock) * 1000; // Convert kg to grams


        if (totalGramsRequested > stock) {
            return res.status(400).json({
                error: `Not enough stock. Requested: ${totalGramsRequested} grams, Available: ${stock} grams`
            });
        }

        // Insert into cart
        const cart = await pool.query(
            'INSERT INTO public.tbl_cart(product_id, pricegrams_id, quantity, user_id,price) VALUES($1, $2, $3, $4,$5) RETURNING *',
            [product_id, pricegrams_id, quantity, user_id, price]
        );

        res.status(200).json({
            statusCode: 200,
            message: 'Cart Added Successfully',
            cart: cart.rows[0],
        });
    } catch (error) {
        console.error('Error in addCart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getcartuserByid = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                statusCode: 400,
                message: "user_id is required"
            });
        }

        const cartItems = await pool.query(
            `
            SELECT 
                c.cart_id,
                c.quantity,
                c.price,
                p.product_id,
                p.product_name,
                p.product_image,
                p.stock,
                g.pricegrams_id,
                g.grams,
                g.price
            FROM 
                tbl_cart c
            JOIN 
                tbl_product p ON c.product_id = p.product_id
            JOIN 
                tbl_grams g ON c.pricegrams_id = g.pricegrams_id
            WHERE 
                c.user_id = $1
            `,
            [user_id]
        );

        if (cartItems.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: "Cart is empty for this user"
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: 'Cart fetched successfully',
            cart: cartItems.rows
        });
    } catch (error) {
        console.error('getcartByid error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error'
        });
    }
};


exports.getallCarts = async (req, res) => {
    try {
        const allcategory = await pool.query("SELECT * FROM tbl_cart");
        res.status(200).json({
            statusCode: 200,
            message: 'Categories Fetched Sucessfully',
            categories: allcategory.rows,
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal Server error' })
    }
}

 


exports.updatecartproduct = async (req, res) => {
    try {
        const { cart_id, quantity } = req.body
        const fileds = [];
        const values = [];
        let index = 1;


        if (quantity) {
            fileds.push(`"quantity"=$${index++}`);
            values.push(quantity)
        }

        values.push(cart_id);
        if (fileds.length === 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'No fileds provided to update'
            })
        }
        const query = `
    UPDATE tbl_cart
    SET ${fileds.join(', ')}
    WHERE "cart_id"=$${index++}
    RETURNING *`
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'cart Not Found'

            })
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Cart Updated Sucesfully',
            category: result.rows[0],

        })
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    } 
}

exports.deleteCart = async (req, res) => {
    try {
        const { cart_id } = req.body;

        if (!cart_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Cart ID is required',
            });
        }


        const checkCart = await pool.query(
            'SELECT * FROM tbl_cart WHERE cart_id = $1',
            [cart_id]
        );

        if (checkCart.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Cart not found',
            });
        }


        const deleteCart = await pool.query(
            'DELETE FROM tbl_cart WHERE cart_id = $1 RETURNING *',
            [cart_id]
        );

        res.status(200).json({
            statusCode: 200,
            message: 'Cart deleted successfully',
            deletedCart: deleteCart.rows[0],
        });

    } catch (error) {
        
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};



exports.deleteallCart = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'user ID is required',
            });
        }


        const checkCart = await pool.query(
            'SELECT * FROM tbl_cart WHERE user_id = $1',
            [user_id]
        );

        if (checkCart.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Cart not found',
            });
        }


        const deleteCart = await pool.query(
            'DELETE FROM tbl_cart WHERE user_id = $1 RETURNING *',
            [user_id]
        );

        res.status(200).json({
            statusCode: 200,
            message: 'deleted successfully',
            deletedCart: deleteCart.rows[0],
        });

    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};
