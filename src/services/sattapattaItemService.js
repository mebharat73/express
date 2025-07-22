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
      .sort({ createdAt: -1 }) // Sort newest first
      .populate({
        path: 'owner',
        select: 'username email',
        strictPopulate: false, // prevent crash on broken refs
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
    updateData.updatedAt = new Date();
    return await SattapattaItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'username email');
  } catch (error) {
    throw new Error(`Error updating item: ${error.message}`);
  }
},



  findById: async (id) => {
  try {
    return await SattapattaItem.findById(id); // No populate
  } catch (error) {
    throw new Error(`Error finding item: ${error.message}`);
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

