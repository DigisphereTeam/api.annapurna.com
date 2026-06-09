const pool = require('../db/db');
const bcrypt = require('bcryptjs');


exports.addCoupon = async (req, res) => {
    const { coupon_code,discount,amount,start_date,expairy_date,status} = req.body

    try {
        if (!coupon_code) {
            return res.status(400).json({ error: 'coupon_code required' });

        }

      
        const exisCoupon = await pool.query('SELECT * FROM public.tbl_coupons WHERE coupon_code=$1', [coupon_code]);
        if (exisCoupon.rows.length > 0) {
            return res.status(400).json({ 
                stausCode:400,
                message: 'coupon already exists' });
        }

         
        const coupon = await pool.query(
            'INSERT INTO public.tbl_coupons(coupon_code,discount,amount,start_date,expairy_date,status) VALUES($1,$2,$3,$4,$5,$6)',
            [coupon_code,discount,amount,start_date,expairy_date,status]
        )

        res.status(200).json({
            statusCode: 200,
            message: 'Coupon Added Successfully',
            coupon: coupon.rows[0],
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

 


exports.getallCoupons=async(req,res)=>{
    try
    {
        const allcoupons=await pool.query("SELECT * FROM tbl_coupons");
        res.status(200).json({
            statusCode:200,
            message:'Coupons Fetched Sucessfully',
            coupons:allcoupons.rows,
        })
    }catch(err){
        res.status(500).json({message:'Internal Server error'})
    }
}

exports.getcouponsByid=async(req,res)=>{
    try
    {
        const {coupon_id}=req.body;
        
        const couponid=await pool.query(
            "SELECT * FROM tbl_coupons WHERE coupon_id=$1",
            [coupon_id] 
        );

        if(couponid.rows.length ===0){
            return res.status(404).json({
                statusCode:404,
                message:"coupon not found"
            })
        }
        res.status(200).json({
            statusCode:200,
            message:'coupon fectched sucessfully',
            coupon:couponid.rows[0]
        })
    }catch(error){
        res.status(500).json({
            statusCode:500,
            message:'internal Server error'
        })
    }
}


exports.updatecoupon=async(req,res)=>{
    try{
    const { coupon_id,coupon_code,discount,amount,start_date,expairy_date,status}=req.body
    const fileds=[];
    const values=[];
    let index=1;
    

    if(coupon_code){
        fileds.push(`"coupon_code"=$${index++}`);
        values.push(coupon_code)
    }
    if(discount){
        fileds.push(`"discount"=$${index++}`);
        values.push(discount)
    }
     
    if(amount){
        fileds.push(`"amount"=$${index++}`);
        values.push(amount)
    }
     
    if(start_date){
        fileds.push(`"start_date"=$${index++}`);
        values.push(start_date)
    }
     
    if(expairy_date){
        fileds.push(`"expairy_date"=$${index++}`);
        values.push(expairy_date)
    }
     
    if(status){
        fileds.push(`"status"=$${index++}`);
        values.push(status)
    }
     
    values.push(coupon_id);
    if(fileds.length === 0){
        return res.status(400).json({
            statusCode:400,
            message:'No fileds provided to update'
        })
    }
    const query=`
    UPDATE tbl_coupons
    SET ${fileds.join(', ')}
    WHERE "coupon_id"=$${index++}
    RETURNING *`
    const  result=await pool.query(query,values);
    if(result.rowCount ===0){
        return res.status(404).json({
            statusCode:404,
            message:'coupon Not Found'
        
        })  
    }
    res.status(200).json({
        statusCode:200,
        message:'Coupon Updated Sucesfully',
        coupon:result.rows[0],

    })
    }catch(error){
        res.status(500).json({  
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
}

exports.deleteCoupon = async (req, res) => {
    try {
        const { coupon_id } = req.body;

        if (!coupon_id) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Coupon ID is required',
            });
        }

       
        const checkCoupon = await pool.query(
            'SELECT * FROM tbl_coupons WHERE coupon_id = $1',
            [coupon_id]
        );

        if (checkCoupon.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Coupon not found',
            });
        }

        
        const deleteCoupon = await pool.query(
            'DELETE FROM tbl_coupons WHERE coupon_id = $1 RETURNING *',
            [coupon_id]
        );

        res.status(200).json({
            statusCode: 200,
            message: 'Coupon deleted successfully',
            deletedCoupon: deleteCoupon.rows[0],
        });

    } catch (error) {
        
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};

 
 
exports.getactiveCoupons = async (req, res) => {
    try {
        const query = "SELECT * FROM tbl_coupons WHERE status = $1";
        const allCoupons = await pool.query(query, ['Active']); // Fetch only active coupons

        res.status(200).json({
            statusCode: 200,
            message: 'Coupons fetched successfully',
            coupons: allCoupons.rows,
        });
    } catch (err) {
        console.error("Error fetching active coupons:", err);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
};
