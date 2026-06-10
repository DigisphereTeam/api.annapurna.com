const express = require("express");
const path = require("path");
const cors = require("cors");
const dotEnv = require("dotenv")

const userRoutes = require('./routes/userroutes');
const adminRoutes = require('./routes/adminroutes');
const categoryRoutes = require('./routes/categoryroutes');
const productRoutes = require('./routes/productsroutes');
const couponRoutes = require('./routes/couponroutes');
const carouselRoutes = require('./routes/carouselroutes');
const cartRoutes = require('./routes/cartroutes');
const orderRoutes = require('./routes/orderroutes');
const dashboardRoutes = require('./routes/dashboardroutes');
const notify = require('./routes/notifyroutes');
const sendResponse = require("./utils/sendResponse.js");
const notFoundController = require("./utils/notFound.js")

dotEnv.config();
const app = express();

app.get("/", (_, res) => {
    sendResponse(res, 200, "Server is up and runnning")
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/category', categoryRoutes);
app.use('/products', productRoutes);
app.use('/coupons', couponRoutes);
app.use('/carousel', carouselRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notify', notify);

app.use(notFoundController);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
