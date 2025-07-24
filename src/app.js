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
import chatRoutes from './routes/chatRoutes.js'; // Add this
import contactRoutes from './routes/contactRoutes.js';
import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';







dotenv.config();
connectDB();
connectCloudinary();

const app = express();



// Middlewares
const upload = multer({ storage: multer.memoryStorage() });


const allowedOrigins = [
  'https://react-with-next-js-q7ee.vercel.app',
  'http://localhost:3000'
];

app.use(logger);
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS not allowed for ${origin}`));
    }
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "hbs");

// Routes
app.get("/", (req, res) => {
  res.json({
    name: "satta-patta.api",
    status: "OK",
    version: "1.1.0",
    url: "https://expresswithnode.vercel.app",
    port: process.env.PORT || 5000,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", upload.single("image"), userRoutes);
app.use("/api/products", upload.array("images", 5), productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/page", viewRoutes);
app.use('/api/sattapatta-items', sattapattaItemRoutes);
app.use('/api/exchange-offers', sattapattaExchangeOfferRoutes);
app.use("/api/chat", chatRoutes); // REST endpoint for fetching chat messages
app.use('/api/contact', contactRoutes);





// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`REST API running on port ${PORT}`);
});
