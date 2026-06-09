const pool = require('../db/db');


exports.addCarousel = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one carousel image is required' });
        }

        // Extract filenames
        const carouselImages = req.files.map(file => `uploads/${file.filename}`);

        // Check for existing images
        for (const image of carouselImages) {
            const existcarousel = await pool.query('SELECT * FROM public.tbl_carousel WHERE carousel_image=$1', [image]);
            if (existcarousel.rows.length > 0) {
                return res.status(400).json({ 
                    statusCode: 400,
                    message: `Image ${image} already exists`
                });
            }
        }

        // Insert images into the database
        const values = carouselImages.map(image => `('${image}')`).join(',');
        const query = `INSERT INTO public.tbl_carousel (carousel_image) VALUES ${values} RETURNING *`;
        const result = await pool.query(query);

        res.status(200).json({
            statusCode: 200,
            message: 'Carousel images added successfully',
            carousel: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





exports.getallCarousels = async (req, res) => {
    try {
        const allcarousels = await pool.query("SELECT * FROM tbl_carousel");
        res.status(200).json({
            statusCode: 200,
            message: 'Carousel Fetched Sucessfully',
            carousels: allcarousels.rows,
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal Server error' })
    }
}

exports.getcarouselByid = async (req, res) => {
    try {
        const { carousel_id } = req.body;

        const carousleid = await pool.query(
            "SELECT * FROM tbl_carousel WHERE carousel_id=$1",
            [carousel_id]
        );

        if (carousleid.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: "image not found"
            })
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Carousel fectched sucessfully',
            carousel: carousleid.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: 'internal Server error'
        })
    }
}


exports.updatecarousel = async (req, res) => {
    try {
        const { carousel_id } = req.body;  
        const fields = [];
        const values = [];
        let index = 1;
 
        if (!carousel_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Carousel ID is required for updating'
            });
        }

        
        const carouselImage = req.files?.carousel_image?.[0]?.filename
            ? `uploads/${req.files.carousel_image[0].filename}`
            : null;

       
        if (carouselImage) {
            fields.push(`"carousel_image"=$${index++}`);
            values.push(carouselImage);
        }

        values.push(carousel_id);  

       
        if (fields.length === 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'No fields provided to update'
            });
        }

      
        const query = `
            UPDATE public.tbl_carousel
            SET ${fields.join(', ')}
            WHERE "carousel_id"=$${index}
            RETURNING *`;

        const result = await pool.query(query, values);

      
        if (result.rowCount === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Carousel image not found'
            });
        }

        // Success response
        res.status(200).json({
            statusCode: 200,
            message: 'Carousel updated successfully',
            carousel: result.rows[0],
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};


exports.deleteCarousel = async (req, res) => {
    try {
        const { carousel_id } = req.body;

        if (!carousel_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Carousel ID is required',
            });
        }


        const checkCarousel = await pool.query(
            'SELECT * FROM tbl_carousel WHERE carousel_id = $1',
            [carousel_id]
        );

        if (checkCarousel.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Carousel not found',
            });
        }


        const deletecarousel = await pool.query(
            'DELETE FROM tbl_carousel WHERE carousel_id = $1 RETURNING *',
            [carousel_id]
        );

        res.status(200).json({
            statusCode: 200,
            message: 'Carousel deleted successfully',
            deletedCarousel: deletecarousel.rows[0],
        });

    } catch (error) {

        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};

