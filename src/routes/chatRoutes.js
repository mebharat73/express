// routes/chatRoutes.js
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import {
  getMessagesBetweenUsers,
  getUnseenMessageCount,
  markMessagesAsSeen
} from '../controllers/chatController.js';

const router = express.Router();
const upload = multer();

// Get messages between users
router.get('/private', getMessagesBetweenUsers);

// Get unseen messages count
router.get('/unseen-count/:userId', getUnseenMessageCount);

// Mark messages as seen
router.post('/mark-seen', markMessagesAsSeen);

// Upload a file (PDF, image, etc.)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = req.file.originalname;
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'chat_attachments',
            resource_type: 'auto',
            public_id: `${baseName}.${fileExtension}`, // Name with extension
            use_filename: false,
            unique_filename: false,
            overwrite: false,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    res.json({
      url: result.secure_url,
      format: fileExtension.toLowerCase(), // Ensure correct extension
      original_filename: originalName,
      resource_type: result.resource_type,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
