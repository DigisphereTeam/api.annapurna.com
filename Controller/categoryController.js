const pool = require('../db/db');
const bcrypt = require('bcryptjs');


exports.addCategory = async (req, res) => {
    const { category_name} = req.body

    try {
        if (!category_name) {
            return res.status(400).json({ error: 'category_name required' });

        }

      
        const existUser = await pool.query('SELECT * FROM public.tbl_category WHERE category_name=$1', [category_name]);
        if (existUser.rows.length > 0) {
            return res.status(400).json({ 
                stausCode:400,
                 message: 'category already exists' });
        }

        const categoryImage = req.files && req.files.category_image
        ? `uploads/${req.files.category_image[0].filename}`
        : null;
    
         
        const category = await pool.query(
            'INSERT INTO public.tbl_category(category_name, category_image) VALUES($1, $2) RETURNING *',
            [category_name, categoryImage]
        );
        

        res.status(200).json({
            statusCode: 200,
            message: 'Category Added Successfully',
            category: category.rows[0],
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}
 


exports.getallCategories=async(req,res)=>{
    try
    {
        const allcategory=await pool.query("SELECT * FROM tbl_category");
        res.status(200).json({
            statusCode:200,
            message:'Categories Fetched Sucessfully',
            categories:allcategory.rows,
        })
    }catch(err){
        res.status(500).json({message:'Internal Server error'})
    }
}

exports.getcategoryByid=async(req,res)=>{
    try
    {
        const {category_id}=req.body;
        
        const categoryid=await pool.query(
            "SELECT * FROM tbl_category WHERE category_id=$1",
            [category_id] 
        );

        if(categoryid.rows.length ===0){
            return res.status(404).json({
                statusCode:404,
                message:"category not found"
            })
        }
        res.status(200).json({
            statusCode:200,
            message:'category fectched sucessfully',
            category:categoryid.rows[0]
        })
    }catch(error){
        res.status(500).json({
            statusCode:500,
            message:'internal Server error'
        })
    }
}


exports.updateCategory = async (req, res) => {
    try {
        const { category_id, category_name } = req.body;
        let categoryImage = null;

        
        if (req.files?.category_image?.[0]?.filename) {
            categoryImage = `uploads/${req.files.category_image[0].filename}`;
        }

        
        if (!category_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Category ID is required',
            });
        }

        const fields = [];
        const values = [];
        let index = 1;

        if (category_name) {
            fields.push(`"category_name"=$${index++}`);
            values.push(category_name);
        }

        if (categoryImage) {
            fields.push(`"category_image"=$${index++}`);
            values.push(categoryImage);
        }

        values.push(category_id);

        if (fields.length === 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'No fields provided to update',
            });
        }

        const query = `
            UPDATE tbl_category
            SET ${fields.join(', ')}
            WHERE "category_id"=$${index}
            RETURNING *`;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Category Not Found',
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: 'Category Updated Successfully',
            category: result.rows[0],
        });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            details: error.message,
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { category_id } = req.body;

        if (!category_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Category ID is required',
            });
        }

       
        const checkCategory = await pool.query(
            'SELECT * FROM tbl_category WHERE category_id = $1',
            [category_id]
        );

        if (checkCategory.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Category not found',
            });
        }

        
        const deleteCategory = await pool.query(
            'DELETE FROM tbl_category WHERE category_id = $1 RETURNING *',
            [category_id]
        );

        res.status(200).json({
            statusCode: 200,
            message: 'Category deleted successfully',
            deletedCategory: deleteCategory.rows[0],
        });

    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};

 