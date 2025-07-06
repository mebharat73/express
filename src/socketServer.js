import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import ChatMessage from './models/ChatMessage.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://react-with-next-js-q7ee.vercel.app',
  'http://localhost:3000'
];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Socket.IO CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  allowEIO3: true
});

// Optional health check route
app.get('/', (req, res) => {
  res.send('Socket.IO server is running');
});

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
      if (data.to && onlineUsers[data.to]) {
        io.to(onlineUsers[data.to]).emit('newMessage', msg);
      }
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
    if (onlineUsers[userId] === socket.id) {
      delete onlineUsers[userId];
      io.emit('presence', onlineUsers);
      console.log(`User ${userId} disconnected`);
    }
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

