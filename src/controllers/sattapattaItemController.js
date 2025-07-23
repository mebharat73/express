import { v2 as cloudinary } from 'cloudinary';
import sattapattaItemService from '../services/sattapattaItemService.js';

const sattapattaItemController = {
  createItem: async (req, res) => {
    try {
      console.log('Received body:', req.body);
      console.log('Received files:', req.files);
      console.log('Authenticated user:', req.user);
      console.log("Creating item for user:", req.user);

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
            { folder: CLOUDINARY_FOLDER }, // You can rename this folder
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
      const items = await sattapattaItemService.getAllItems(req.query);
      res.json(items);
    } catch (error) {
      console.error('🔥 getAllItems Controller Error:', error); // See full stack
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
    const item = await sattapattaItemService.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Allow deletion if user is the owner or admin
    const isOwner = item.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin'; // Ensure your user model includes a role field

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: You cannot delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('🔥 Error deleting item:', error);
    res.status(500).json({ message: error.message });
  }
},

  editOwnItem: async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await sattapattaItemService.getItemById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const isOwner = item.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: You cannot edit this item' });
    }

    const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];

    const oldImageUrls = item.imageUrls || [];
    const removedImages = oldImageUrls.filter(url => !existingImages.includes(url));

    const extractPublicId = (url) => {
      const parts = url.split('/');
      const folderIndex = parts.findIndex(part => part === CLOUDINARY_FOLDER);
      if (folderIndex === -1) return null;
      const publicId = parts.slice(folderIndex).join('/').split('.')[0]; // Remove extension
      return publicId;
    };

    console.log(`Removing ${removedImages.length} images from Cloudinary...`);
    for (const url of removedImages) {
      const publicId = extractPublicId(url);
      console.log(`Deleting image: ${url} with publicId: ${publicId}`);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
          console.log(`Successfully deleted: ${publicId}`);
        } catch (error) {
          console.warn(`❌ Failed to delete Cloudinary image: ${publicId}`, error.message);
        }
      }
    }

    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} new images to folder: ${CLOUDINARY_FOLDER}`);
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: CLOUDINARY_FOLDER,  // <-- hardcoded here for test
              resource_type: 'auto',
              invalidate: true,
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(new Error('Cloudinary upload failed: ' + error.message));
              }
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        console.log('Uploaded image URL:', uploaded.secure_url);
        newImageUrls.push(uploaded.secure_url);
      }
    } else {
      console.log('No new images to upload.');
    }

    const updatedData = {
      ...req.body,
      imageUrls: [...existingImages, ...newImageUrls],
    };

    console.log('Updating item with data:', updatedData);

    const updatedItem = await sattapattaItemService.updateItem(itemId, updatedData);

    console.log('Item updated successfully:', updatedItem._id);
    res.json(updatedItem);
  } catch (error) {
    console.error('🔥 Error editing item:', error);
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
