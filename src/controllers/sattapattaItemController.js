import { v2 as cloudinary } from 'cloudinary';
import sattapattaItemService from '../services/sattapattaItemService.js';

const sattapattaItemController = {
  createItem: async (req, res) => {
    try {
      

      // Ensure req.user is populated correctly
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }

      // Add owner ID to item data
      const itemData = { ...req.body, owner: req.user.id };

      // Validate uploaded files
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Upload files to Cloudinary
      const uploadResults = [];

      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'your_folder_name' }, // You can rename this folder
            (error, result) => {
              if (error) {
                return reject(new Error('Cloudinary upload failed: ' + error.message));
              }
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadResults.push(result);
      }

      // Attach image URLs to the item data
      itemData.imageUrls = uploadResults.map(result => result.secure_url);

      // Save to database
      const newItem = await sattapattaItemService.createItem(itemData);
      res.status(201).json(newItem);

    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  },

  getItemById: async (req, res) => {
    try {
      const item = await sattapattaItemService.getItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllItems: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 18;
      const skip = (page - 1) * limit;

      const items = await sattapattaItemService.getAllItems({ skip, limit });
      const totalItems = await sattapattaItemService.countItems();

      res.json({ items, totalItems });
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

  deleteItem: async (req, res) => {
    try {
      const item = await SattapattaItem.findById(req.params.id);

      if (!item) return res.status(404).json({ message: 'Item not found' });

      // Ensure only the owner can delete
      if (item.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await item.deleteOne();
      res.json({ message: 'Item deleted successfully' });
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
  }
};

export default sattapattaItemController;
