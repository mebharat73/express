import { v2 as cloudinary } from 'cloudinary';
import sattapattaItemService from '../services/sattapattaItemService.js';

const CLOUDINARY_FOLDER = 'your_folder_name'; // 🔁 Set this to your Cloudinary folder

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
      const itemId = req.params.id;
      const item = await sattapattaItemService.getItemById(itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });

      const isOwner = item.owner.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const updatedData = { ...req.body };

      const existingImages = req.body.existingImages
        ? JSON.parse(req.body.existingImages)
        : [];

      const removedImages = item.imageUrls.filter(url => !existingImages.includes(url));

      for (const url of removedImages) {
        const parts = url.split('/');
        const filenameWithExt = parts[parts.length - 1];
        const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`;

        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        } catch (err) {
          console.warn('⚠️ Cloudinary deletion failed for', publicId, err.message);
        }
      }

      let newImageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const uploaded = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: CLOUDINARY_FOLDER,
                resource_type: 'auto',
                invalidate: true,
              },
              (error, result) => {
                if (error) return reject(new Error('Cloudinary upload failed: ' + error.message));
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });

          newImageUrls.push(uploaded.secure_url);
        }
      }

      updatedData.imageUrls = [...existingImages, ...newImageUrls];

      const updatedItem = await sattapattaItemService.updateItem(itemId, updatedData);
      res.json(updatedItem);
    } catch (error) {
      console.error('🔥 Error editing item:', error);
      res.status(500).json({ message: error.message });
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
