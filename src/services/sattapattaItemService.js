import SattapattaItem from '../models/SattapattaItem.js';
import uploadFile from '../utils/file.js'; // Corrected import path to file.js

const sattapattaItemService = {
  createItem: async (itemData) => {
    try {
      // If image files are provided, upload them first
      if (itemData.imageFiles && itemData.imageFiles.length > 0) {
        const uploadResults = await uploadFile(itemData.imageFiles);
        itemData.imageUrls = uploadResults.map(result => result.secure_url);
      }

      const newItem = new SattapattaItem(itemData);
      return await newItem.save();
    } catch (error) {
      throw new Error(`Error creating item: ${error.message}`);
    }
  },

  getItemById: async (id) => {
    try {
      return await SattapattaItem.findById(id).populate('owner', 'username email'); // Populate owner details
    } catch (error) {
      throw new Error(`Error fetching item: ${error.message}`);
    }
  },

  getAllItems: async (query = {}) => {
    try {
      const items = await SattapattaItem.find(query)
        .populate({
          path: 'owner',
          select: 'username email',
          strictPopulate: false, // <— prevents crash on broken refs
        })
        .lean();

      // Optional: Filter out items that failed to populate owner
      return items.filter(item => item.owner); 
    } catch (error) {
      console.error('🔥 Error fetching items:', error);
      throw new Error(`Error fetching items: ${error.message}`);
    }
  },





  updateItem: async (id, updateData) => {
    try {
      if (updateData.imageFiles && updateData.imageFiles.length > 0) {
        const uploadResults = await uploadFile(updateData.imageFiles);
        updateData.imageUrls = uploadResults.map(result => result.secure_url);
      }
      return await SattapattaItem.findByIdAndUpdate(id, updateData, { new: true }).populate('owner', 'username email');
    } catch (error) {
      throw new Error(`Error updating item: ${error.message}`);
    }
  },

  deleteItem: async (id) => {
    try {
      await SattapattaItem.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting item: ${error.message}`);
    }
  },

  getItemsByOwner: async (ownerId) => {
    try {
      return await SattapattaItem.find({ owner: ownerId }).populate('owner', 'username email');
    } catch (error) {
      throw new Error(`Error fetching items by owner: ${error.message}`);
    }
  }
};

export default sattapattaItemService;

