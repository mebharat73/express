import mongoose from 'mongoose';
import SattapattaExchangeOffer from '../models/SattapattaExchangeOffer.js';
import SattapattaItem from '../models/SattapattaItem.js';



const exchangeOfferService = {
  createOffer: async (offerData) => {
  try {
    const { itemRequested, itemOffered } = offerData;

    const requestedItem = await SattapattaItem.findById(itemRequested);
    const offeredItem = await SattapattaItem.findById(itemOffered);

    if (!requestedItem || !offeredItem) {
      throw new Error('Invalid itemRequested or itemOffered');
    }

    offerData.requestedItemOwnerId = requestedItem.owner;
    offerData.offeredItemOwnerId = offeredItem.owner;

    const newOffer = new SattapattaExchangeOffer(offerData);
    return await newOffer.save();
  } catch (error) {
    throw new Error(`Error creating offer: ${error.message}`);
  }
},


  // Updated getOffersByRequestedItems function


  getOffersByRequestedItems: async (itemIds) => {
  try {
    const objectIds = itemIds.map(id => new mongoose.Types.ObjectId(id));

    const offers = await SattapattaExchangeOffer.find({
      itemRequested: { $in: objectIds },
      status: 'pending',
    })
      .populate('offeredBy', 'name email phone')  // <-- use 'name' here
      .populate('itemOffered', 'title')
      .populate('itemRequested', 'title')
      .exec();

    console.log('Raw offers with populated fields:', offers);

    return offers.map((offer) => ({
      _id: offer._id,
      fromUserName: offer.offeredBy?.name || "Unknown",
      offeredProductTitle: offer.itemOffered?.title || "N/A",
      requestedProductTitle: offer.itemRequested?.title || "N/A",
      additionalPrice: offer.extraPrice || 0,
      status: offer.status,
      createdAt: offer.createdAt,
      itemRequestedOwner: offer.itemRequested?.owner?._id?.toString() || null, // 👈 required for UI logic
    }));
  } catch (error) {
    throw new Error(`Error fetching offers by requested items: ${error.message}`);
  }
},


  getOfferById: async (id) => {
  try {
    return await SattapattaExchangeOffer.findById(id)
      .populate('offeredBy', 'name email') // requester info
      .populate({
        path: 'itemOffered',
        populate: {
          path: 'owner',
          select: 'name email phone' // 🔑 this is the item owner
        }
      })
      .populate({
        path: 'itemRequested',
        populate: {
          path: 'owner',
          select: 'name email phone' // this is the requester's item (optional)
        }
      });
  } catch (error) {
    throw new Error(`Error fetching offer: ${error.message}`);
  }
},





    // services/exchangeOfferService.js

getOffersForUser: async (userId) => {
  const userItems = await SattapattaItem.find({ owner: userId }, '_id');
  const ownedItemIds = userItems.map(item => item._id);

  const offers = await SattapattaExchangeOffer.find({
    $or: [
      { offeredBy: userId },
      { requestedItemOwnerId: userId },
      { offeredItemOwnerId: userId }
    ]
  })
    .sort({ createdAt: -1 })
    .populate({
      path: 'itemOffered',
      select: 'title owner imageUrls',
      populate: { path: 'owner', select: 'name email phone' }
    })
    .populate({
      path: 'itemRequested',
      select: 'title owner imageUrls',
      populate: { path: 'owner', select: 'name email phone' }
    })
    .populate('offeredBy', 'name email phone')
    .lean();

  return offers.map(offer => ({
      _id: offer._id.toString(),
  fromUserName: offer.offeredBy?.name || 'Unknown',
  fromUserId: offer.offeredBy?._id?.toString(),
  offeredProductTitle: offer.itemOffered?.title || 'N/A',
  offeredItemOwnerId: offer.offeredItemOwnerId?.toString() || offer.itemOffered?.owner?._id?.toString() || null,
  offeredItemOwnerEmail: offer.itemOffered?.owner?.email || null,
  offeredItemOwnerPhone: offer.itemOffered?.owner?.phone || null,
  offeredItemImage: offer.itemOffered?.imageUrls?.[0] || null, // ✅ New line

  requestedProductTitle: offer.itemRequested?.title || 'N/A',
  requestedItemOwnerId: offer.requestedItemOwnerId?.toString() || offer.itemRequested?.owner?._id?.toString() || null,
  requestedItemOwnerEmail: offer.itemRequested?.owner?.email || null,
  requestedItemOwnerPhone: offer.itemRequested?.owner?.phone || null,
  requestedItemImage: offer.itemRequested?.imageUrls?.[0] || null, // ✅ New line

  status: offer.status,
  additionalPrice: offer.extraPrice
  }));
},








  getAllOffers: async (query = {}) => {
    try {
      return await SattapattaExchangeOffer.find(query)
        .populate('offeredBy', 'username email')
        .populate({
          path: 'itemOffered',
          populate: { path: 'owner', select: 'username email' }
        })
        .populate({
          path: 'itemRequested',
          populate: { path: 'owner', select: 'username email' }
        });
    } catch (error) {
      throw new Error(`Error fetching all offers: ${error.message}`);
    }
  },


  // services/exchangeOfferService.js

    getExchangeItemIds: async () => {
        try {
          const offers = await SattapattaExchangeOffer.find({
            status: { $in: ['pending', 'accepted'] }
          }).select('itemOffered itemRequested'); // ✅ No populate

          // Extract item IDs
          const itemIds = new Set();
          offers.forEach(offer => {
            itemIds.add(String(offer.itemOffered));
            itemIds.add(String(offer.itemRequested));
          });

          return Array.from(itemIds);
        } catch (error) {
          throw new Error(`Error fetching exchange item IDs: ${error.message}`);
        }
      },





  

  updateOffer: async (id, updateData) => {
    try {
      return await SattapattaExchangeOffer.findByIdAndUpdate(id, updateData, { new: true })
        .populate('offeredBy', 'username email')
        .populate({
          path: 'itemOffered',
          populate: { path: 'owner', select: 'username email' }
        })
        .populate({
          path: 'itemRequested',
          populate: { path: 'owner', select: 'username email' }
        });
    } catch (error) {
      throw new Error(`Error updating offer: ${error.message}`);
    }
  },

  deleteOffer: async (id) => {
    try {
      await SattapattaExchangeOffer.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting offer: ${error.message}`);
    }
  },

  getOffersByOfferedBy: async (userId) => {
    try {
      return await SattapattaExchangeOffer.find({ offeredBy: userId })
        .populate('offeredBy', 'username email')
        .populate({
          path: 'itemOffered',
          populate: { path: 'owner', select: 'username email' }
        })
        .populate({
          path: 'itemRequested',
          populate: { path: 'owner', select: 'username email' }
        });
    } catch (error) {
      throw new Error(`Error fetching offers by user: ${error.message}`);
    }
  },

  getOffersByItem: async (itemId) => {
    try {
      return await SattapattaExchangeOffer.find({
        $or: [{ itemOffered: itemId }, { itemRequested: itemId }],
      })
        .populate('offeredBy', 'username email')
        .populate({
          path: 'itemOffered',
          populate: { path: 'owner', select: 'username email' }
        })
        .populate({
          path: 'itemRequested',
          populate: { path: 'owner', select: 'username email' }
        });
    } catch (error) {
      throw new Error(`Error fetching offers by item: ${error.message}`);
    }
  },
};

export default exchangeOfferService;
