import dotenv from 'dotenv';
import express from "express";
import http from "http"; // Add this
import { Server } from "socket.io"; // Add this
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
import ChatMessage from './models/ChatMessage.js'; // Add this
import contactRoutes from './routes/contactRoutes.js';
import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';







dotenv.config();
connectDB();
connectCloudinary();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.APP_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  allowEIO3: true, // ✅ Add this for IE compatibility
});


// Middlewares
const upload = multer({ storage: multer.memoryStorage() });

app.use(logger);
const allowedOrigins = [
  'https://react-with-next-js-q7ee.vercel.app',
  'http://localhost:3000'
];


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
app.use('/api/sattapatta-items', upload.array('imageFiles', 5), sattapattaItemRoutes);
app.use('/api/exchange-offers', sattapattaExchangeOfferRoutes);
app.use("/api/chat", chatRoutes); // REST endpoint for fetching chat messages
app.use('/api/contact', contactRoutes);



const onlineUsers = {};

io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;

  if (!userId) {
    console.log('Socket connected without userId, disconnecting...');
    socket.disconnect();
    return;
  }

  onlineUsers[userId] = socket.id;
  io.emit('presence', onlineUsers);
  console.log(`User ${userId} connected`);

  socket.on('getPresence', () => {
    socket.emit('presence', onlineUsers);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const msg = new ChatMessage(data);
      await msg.save();

      // Send to recipient if online
      if (data.to && onlineUsers[data.to]) {
        io.to(onlineUsers[data.to]).emit('newMessage', msg);
      }
      // No need to send back to sender because frontend handles optimistic update
    } catch (err) {
      console.error('sendMessage error:', err);
    }
  });

  socket.on('typing', ({ to, isTyping }) => {
    if (to && onlineUsers[to]) {
      io.to(onlineUsers[to]).emit('typing', { from: userId, isTyping });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from onlineUsers only if this socket.id matches stored one (handle multiple connections)
    if (onlineUsers[userId] === socket.id) {
      delete onlineUsers[userId];
      io.emit('presence', onlineUsers);
      console.log(`User ${userId} disconnected`);
    }
  });
});



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});