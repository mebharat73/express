import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import ChatMessage from './models/ChatMessage.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://react-with-next-js-q7ee.vercel.app',
  'http://localhost:3000'
];

// **Apply CORS to Express endpoints** (health check, etc.)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true
}));

// Optional health check route
app.get('/', (req, res) => {
  res.send('Socket.IO server is running');
});

// **Socket.IO with the same allowedOrigins logic**
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
      return callback(new Error(`Socket.IO CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  allowEIO3: true
});

const onlineUsers = {};

io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;
  if (!userId) return socket.disconnect();

  onlineUsers[userId] = socket.id;
  io.emit('presence', onlineUsers);

  socket.on('sendMessage', async (data) => {
    const msg = new ChatMessage(data);
    await msg.save();
    if (data.to && onlineUsers[data.to]) {
      io.to(onlineUsers[data.to]).emit('newMessage', msg);
    }
  });

  socket.on('disconnect', () => {
    if (onlineUsers[userId] === socket.id) {
      delete onlineUsers[userId];
      io.emit('presence', onlineUsers);
    }
  });
});

const PORT = process.env.PORT; // must use env variable on Render
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
