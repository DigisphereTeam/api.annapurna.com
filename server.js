const express = require("express");
const path = require("path");
const cors = require("cors");

const userRoutes = require('./routes/userroutes');
const adminRoutes = require('./routes/adminroutes');
const categoryRoutes = require('./routes/categoryroutes');
const productRoutes=require('./routes/productsroutes');
const couponRoutes=require('./routes/couponroutes');
const carouselRoutes=require('./routes/carouselroutes');
const cartRoutes=require('./routes/cartroutes');
const orderRoutes=require('./routes/orderroutes');
const dashboardRoutes=require('./routes/dashboardroutes');
const notify=require('./routes/notifyroutes');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
app.use(express.json());
app.use(cors()); 

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/category', categoryRoutes);
app.use('/products', productRoutes);
app.use('/coupons',couponRoutes);
app.use('/carousel',carouselRoutes);
app.use('/cart',cartRoutes);
app.use('/order',orderRoutes);
app.use('/dashboard',dashboardRoutes);
app.use('/notify',notify);




app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
