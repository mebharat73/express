import { v2 as cloudinary } from 'cloudinary';
import sattapattaItemService from '../services/sattapattaItemService.js';

import uploadFile from '../utils/file.js'; // path to your uploadFile utility
const CLOUDINARY_FOLDER = "nodejs-20250302";

const sattapattaItemController = {
  createItem: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }

      const itemData = { ...req.body, owner: req.user.id };

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const uploadResults = [];

      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: CLOUDINARY_FOLDER },
            (error, result) => {
              if (error) return reject(new Error('Cloudinary upload failed: ' + error.message));
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadResults.push(result);
      }

      itemData.imageUrls = uploadResults.map(result => result.secure_url);

      const newItem = await sattapattaItemService.createItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('🔥 Error creating item:', error);
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  },
  editOwnItem: async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const {
      title,
      description,
      estimatedValue,
      condition,
      status,
      existingImages
    } = req.body;

    const existingImageUrls = existingImages ? JSON.parse(existingImages) : [];

    const item = await SattapattaItem.findById(itemId);

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== userId)
      return res.status(403).json({ message: 'Unauthorized' });

    // Upload new images if any
    let uploadedImageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadedFiles = await uploadFile(req.files); // you already have this
      uploadedImageUrls = uploadedFiles.map((file) => file.secure_url);
    }

    // Optionally delete removed images from Cloudinary
    const removedImages = item.imageUrls.filter(
      (url) => !existingImageUrls.includes(url)
    );

    for (const url of removedImages) {
      const filenameWithExt = url.split('/').pop();
      const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`;

      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    }

    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    item.title = title;
    item.description = description;
    item.estimatedValue = estimatedValue;
    item.condition = condition;
    item.status = status;
    item.imageUrls = finalImageUrls;

    await item.save();

    res.status(200).json({ message: 'Item updated successfully', item });
  } catch (error) {
    console.error('Error in editOwnItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
 
  deleteItem: async (req, res) => {
    try {
      const item = await sattapattaItemService.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });

      const isOwner = item.owner.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Unauthorized: You cannot delete this item' });
      }

      // 🔥 Delete all associated Cloudinary images
      for (const url of item.imageUrls || []) {
        const parts = url.split('/');
        const filenameWithExt = parts[parts.length - 1];
        const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`;

        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        } catch (err) {
          console.warn('⚠️ Cloudinary deletion failed for', publicId, err.message);
        }
      }

      await item.deleteOne();
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('🔥 Error deleting item:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getItemById: async (req, res) => {
    try {
      const item = await sattapattaItemService.getItemById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllItems: async (req, res) => {
    try {
      const items = await sattapattaItemService.getAllItems(req.query);
      res.json(items);
    } catch (error) {
      console.error('🔥 getAllItems Controller Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  updateItem: async (req, res) => {
    try {
      const updatedItem = await sattapattaItemService.updateItem(req.params.id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getItemsByOwner: async (req, res) => {
    try {
      const items = await sattapattaItemService.getItemsByOwner(req.user.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default sattapattaItemController;
