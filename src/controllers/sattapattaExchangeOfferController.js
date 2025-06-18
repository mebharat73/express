import exchangeOfferService from '../services/sattapattaExchangeOfferService.js';
import SattapattaItem from '../models/SattapattaItem.js'; // Make sure you import your Item model

const exchangeOfferController = {
  createOffer: async (req, res) => {
  try {
    const offerData = {
      ...req.body,
      offeredBy: req.user.id // Ensure the logged-in user is making the offer
    };
    const newOffer = await exchangeOfferService.createOffer(offerData);
    res.status(201).json(newOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},


  // Controller
getOffersReceived: async (req, res) => {
  try {
    const userId = req.user.id;

    // Now get offers by passing only userId
    const offers = await exchangeOfferService.getOffersForUser(userId);

    res.json(offers);
  } catch (error) {
    console.error("Error in getOffersReceived:", error);
    res.status(500).json({ message: error.message });
  }
},






  getOfferById: async (req, res) => {
    try {
      const offer = await exchangeOfferService.getOfferById(req.params.id);
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllOffers: async (req, res) => {
    try {
      const offers = await exchangeOfferService.getAllOffers(req.query);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOffer: async (req, res) => {
    try {
      const updatedOffer = await exchangeOfferService.updateOffer(req.params.id, req.body);
      if (!updatedOffer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteOffer: async (req, res) => {
    try {
      await exchangeOfferService.deleteOffer(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOffersByOfferedBy: async (req, res) => {
    try {
      const offers = await exchangeOfferService.getOffersByOfferedBy(req.user.id); // <-- changed here
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOffersByItem: async (req, res) => {
    try {
      const offers = await exchangeOfferService.getOffersByItem(req.params.itemId);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

acceptOffer: async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    // Fetch the offer with populated fields to check ownership and details
    const offer = await exchangeOfferService.getOfferById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Authorization: only the offeredItemOwnerId can accept
    if (offer.offeredItemOwnerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    // Update offer status to accepted
    const updatedOffer = await exchangeOfferService.updateOffer(offerId, { status: 'accepted' });

    // Mark both items as exchanged
    await SattapattaItem.findByIdAndUpdate(offer.itemOffered._id, { status: 'exchanged' });
    await SattapattaItem.findByIdAndUpdate(offer.itemRequested._id, { status: 'exchanged' });

    // Return updated offer with populated owner info (including offered item owner contact)
    const populatedOffer = await exchangeOfferService.getOfferById(offerId);

    res.json(populatedOffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

rejectOffer: async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    // Fetch the offer to verify ownership
    const offer = await exchangeOfferService.getOfferById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Authorization: only the offeredItemOwnerId can reject
    if (offer.offeredItemOwnerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to reject this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    // Update offer status to rejected
    const updatedOffer = await exchangeOfferService.updateOffer(offerId, { status: 'rejected' });

    res.json(updatedOffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

};

export default exchangeOfferController;
