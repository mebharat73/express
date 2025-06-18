import dotenv from 'dotenv';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import authRoutes from "./routes/authRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/database.js";
import logger from "./middlewares/logger.js";
import multer from "multer";
import orderRoutes from "./routes/orderRoute.js";
import productRoutes from "./routes/productRoute.js";
import userRoutes from "./routes/userRoute.js";
import viewRoutes from "./routes/viewRoute.js";
import sattapattaItemRoutes from './routes/sattapattaItemRoutes.js';
import sattapattaExchangeOfferRoutes from './routes/sattapattaExchangeOfferRoutes.js';

dotenv.config();

const app = express();

connectDB();
connectCloudinary();

const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(logger);
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend origin
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "hbs");

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    name: "satta-patta.api",
    status: "OK",
    version: "1.1.0",
    url: "https://expresswithnode.vercel.app",
    port: port,
  });
});

// Routes
app.use("/api/products", upload.array("images", 5), productRoutes);
app.use("/api/users", upload.single("image"), userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/page", viewRoutes);
app.use('/api/sattapatta-items', upload.array('imageFiles', 5), sattapattaItemRoutes);
app.use('/api/exchange-offers', sattapattaExchangeOfferRoutes);

app.listen(port, () => {
  console.log(`Server started at port ${port}...`);
});
