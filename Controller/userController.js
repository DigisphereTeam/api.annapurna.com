const pool = require('../db/db');
const bcrypt = require('bcryptjs');


exports.userRegister = async (req, res) => {
    const { first_name, last_name, email, phone_number, password, confirm_password } = req.body

    try {
        if (!email, !password) {
            return res.status(400).json({ error: 'email and password are required' });

        }

        if (password !== confirm_password) {
            return res.status(400).json({ 
                statusCode: 400,
                message: "Password and Confirm Password must be the same" 
            });
        }
        const existUser = await pool.query('SELECT * FROM public.tbl_users WHERE email=$1', [email]);
        if (existUser.rows.length > 0) {
            return res.status(400).json({ 
                stausCode:400,
                message: 'email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await pool.query(
            'INSERT INTO public.tbl_users(first_name,last_name,email,phone_number,password,confirm_password) VALUES($1,$2,$3,$4,$5,$6)',
            [first_name, last_name, email, phone_number, hashedPassword, hashedPassword]
        )

        res.status(200).json({
            statusCode: 200,
            message: 'User Added Successfully',
            user: user.rows[0],
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

exports.userSignin = async (req, res) => {
    const { email, password } = req.body;

 
    if (!email || !password) {
        return res.status(400).json({ 
            statusCode: 400,
            message: "Email and password are required"
        });
    }

    try {
       
        const result = await pool.query("SELECT * FROM tbl_users WHERE email=$1", [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                statusCode: 404,
                message: "User not found" 
            });
        }

        const user = result.rows[0];
 
        const isMatch = await bcrypt.compare(password, user.password);

       
        if (!isMatch) { 
            return res.status(401).json({ 
                statusCode: 401,
                message: "Invalid credentials" 
            });
        }

       
        res.status(200).json({
            statusCode: 200,
            message: "Login Successful",
            user
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ 
            statusCode: 500,
            message: "Internal Server Error" 
        });
    }
};


exports.getallusers=async(req,res)=>{
    try
    {
        const alluser=await pool.query("SELECT * FROM tbl_users");
        res.status(200).json({
            statusCode:200,
            message:'User Fetched Sucessfully',
            users:alluser.rows,
        })
    }catch(err){
        res.status(500).json({message:'Internal Server error'})
    }
}

exports.getuserByid=async(req,res)=>{
    try
    {
        const {user_id}=req.body;
        
        const userid=await pool.query(
            "SELECT * FROM tbl_users WHERE user_id=$1",
            [user_id] 
        );

        if(userid.rows.length ===0){
            return res.status(404).json({
                statusCode:404,
                message:"user not found"
            })
        }
        res.status(200).json({
            statusCode:200,
            message:'User fectched sucessfully',
            user:userid.rows[0]
        })
    }catch(error){
        res.status(500).json({
            statusCode:500,
            message:'internal Server error'
        })
    }
}


exports.updateUser=async(req,res)=>{
    try{
    const { user_id,first_name, last_name, email, phone_number,street,city,state,pincode}=req.body
    const fileds=[];
    const values=[];
    let index=1;
    
    if(first_name){
        fileds.push(`"first_name"=$${index++}`);
        values.push(first_name)
    }
    if(last_name){
        fileds.push(`"last_name"=$${index++}`);
        values.push(last_name)
    }
    if(email){
        fileds.push(`"email"=$${index++}`)
        values.push(email)
    }
    if(phone_number){
        fileds.push(`"phone_number"=$${index++}`)
        values.push(phone_number)
    }
    if(street){
        fileds.push(`"street"=$${index++}`)
        values.push(street)
    }
    if(city){
        fileds.push(`"city"=$${index++}`)
        values.push(city)
    }
    if(state){
        fileds.push(`"state"=$${index++}`)
        values.push(state)
    }
    if(pincode){
        fileds.push(`"pincode"=$${index++}`)
        values.push(pincode)
    }
    values.push(user_id);
    if(fileds.length === 0){
        return res.status(400).json({
            statusCode:400,
            message:'No fileds provided to update'
        })
    }
    const query=`
    UPDATE tbl_users
    SET ${fileds.join(', ')}
    WHERE "user_id"=$${index++}
    RETURNING *`
    const  result=await pool.query(query,values);
    if(result.rowCount ===0){
        return res.status(404).json({
            statusCode:404,
            message:'User Not Found'
        
        })
    }
    res.status(200).json({
        statusCode:200,
        message:'User Updated Sucesfully',
        user:result.rows[0],

    })
    }catch(error){
        res.status(500).json({  // ✅ Fixed typo: staus → status
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
}