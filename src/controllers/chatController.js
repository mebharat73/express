// controllers/chatController.js
import mongoose from 'mongoose';
import ChatMessage from '../models/ChatMessage.js';

export const getMessagesBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: 'Both user1 and user2 are required' });
  }

  try {
    const messages = await ChatMessage.find({
      $or: [
        { senderId: user1, to: user2 },
        { senderId: user2, to: user1 }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch private messages' });
  }
};



export const getUnseenMessageCount = async (req, res) => {
  const userId = req.params.userId;

  try {
    const unseen = await ChatMessage.aggregate([
      {
        $match: {
          to: new mongoose.Types.ObjectId(userId),
          seen: false,
        },
      },
      {
        $group: {
          _id: '$senderId',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    unseen.forEach(entry => {
      result[entry._id] = entry.count;
    });

    res.json(result);
  } catch (err) {
    console.error('Error getting unseen message count:', err);
    res.status(500).json({ error: 'Failed to fetch unseen message count' });
  }
};


// In chatController.js
export const markMessagesAsSeen = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    await ChatMessage.updateMany(
      { senderId, to: receiverId, seen: false },
      { $set: { seen: true } }
    );
    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark messages as seen' });
  }
};

