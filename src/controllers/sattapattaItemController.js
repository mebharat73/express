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
    const userId = req.user.id; // authenticated user ID from middleware
    const itemId = req.params.id;

    // Destructure fields from req.body
    const {
      title,
      description,
      estimatedValue,
      condition,
      status,
      existingImages, // JSON string of existing image URLs
    } = req.body;

    console.log('🧾 req.files:', req.files);
    console.log('🧾 existingImages:', existingImages);

    // Parse existingImages JSON string safely
    let existingImageUrls = [];
    try {
      existingImageUrls = existingImages ? JSON.parse(existingImages) : [];
    } catch (err) {
      return res.status(400).json({ message: "Invalid format for existingImages" });
    }

    // Find the item in DB
    const item = await sattapattaItemService.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Upload new images (if any)
    let uploadedImageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadFile(req.files); 
      // uploadFile should return array of { secure_url, ... }
      uploadedImageUrls = uploadResults.map(result => result.secure_url);
    }
    console.log('Uploaded:', uploadedImageUrls);

    // Identify removed images (present before but now not kept)
    const removedImages = item.imageUrls.filter(url => !existingImageUrls.includes(url));

    // Delete removed images from Cloudinary
    await Promise.all(
      removedImages.map(async (url) => {
        // Extract filename without extension for public ID
        const filenameWithExt = url.split('/').pop(); // get last part of URL
        const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
          console.log(`Deleted image from Cloudinary: ${publicId}`);
        } catch (error) {
          console.warn(`Failed to delete image ${publicId}:`, error.message);
          // continue without failing the whole request
        }
      })
    );

    // Combine kept images and newly uploaded images
    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    // Update item fields
    item.title = title;
    item.description = description;
    item.estimatedValue = estimatedValue;
    item.condition = condition;
    item.status = status;
    item.imageUrls = finalImageUrls;
    item.updatedAt = new Date();

    // Save updated item
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
