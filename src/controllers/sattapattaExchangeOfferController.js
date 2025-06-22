import exchangeOfferService from '../services/sattapattaExchangeOfferService.js';
import SattapattaItem from '../models/SattapattaItem.js'; // Make sure you import your Item model
import sendEmail from '../utils/email.js';

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

    const offer = await exchangeOfferService.getOfferById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // ✅ Make sure user is the owner of the item being offered
    const itemOwnerId = offer.itemOffered?.owner?._id?.toString();
    if (itemOwnerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    // ✅ Update offer status and item statuses
    await exchangeOfferService.updateOffer(offerId, { status: 'accepted' });
    await SattapattaItem.findByIdAndUpdate(offer.itemOffered._id, { status: 'exchanged' });
    await SattapattaItem.findByIdAndUpdate(offer.itemRequested._id, { status: 'exchanged' });

    // ✅ Send email to requester
    const requester = offer.offeredBy;
    const owner = offer.itemOffered?.owner;

    if (requester?.email && owner) {
      await sendEmail(requester.email, {
        subject: "✅ Your Sattapatta Exchange Offer Was Accepted",
        body: `
          <p>Your exchange offer has been <strong>accepted</strong> by the item owner.</p>
          <p>Here are the contact details of the item owner:</p>
          <ul>
            <li><strong>Name:</strong> ${owner.name}</li>
            <li><strong>Email:</strong> ${owner.email}</li>
            <li><strong>Phone:</strong> ${owner.phone || 'Not provided'}</li>
          </ul>
          <p>Get in touch with the owner to proceed with the exchange. Thank you for using Sattapatta!</p>
        `
      });
    }

    // ✅ Return full details to frontend
    res.json({
      _id: offer._id,
      status: 'accepted',
      fromUserId: requester?._id,
      fromUserName: requester?.name,
      offeredProductTitle: offer.itemRequested?.title,
      requestedProductTitle: offer.itemOffered?.title,
      additionalPrice: offer.extraPrice,
      offeredItemOwnerId: owner?._id,
      offeredItemOwnerEmail: owner?.email,
      offeredItemOwnerPhone: owner?.phone,
    });

  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ message: error.message });
  }
},






rejectOffer: async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    // 1. Fetch the offer with populated fields
    const offer = await exchangeOfferService.getOfferById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // 2. Authorization: only the owner of the requested item (offeredItemOwnerId) can reject
    if (offer.offeredItemOwnerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to reject this offer' });
    }

    // 3. Cannot reject already accepted/rejected offers
    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    // 4. Mark offer as rejected
    const updatedOffer = await exchangeOfferService.updateOffer(offerId, { status: 'rejected' });

    // 5. Send email to the requester (offeredBy)
    const recipientEmail = offer.offeredBy?.email;
    const recipientName = offer.offeredBy?.username || 'user';

    if (recipientEmail) {
      await sendEmail(recipientEmail, {
        subject: 'Regarding your Sattapatta Exchange Offer',
        body: `
          <p>Hello ${recipientName},</p>
          <p>We're sorry to inform you that your offer has been <strong>rejected</strong> by the item owner.</p>
          <p>You may browse other items and try again.</p>
          <p>Thank you for using Sattapatta.</p>
        `
      });
    }

    res.json(updatedOffer);
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(500).json({ message: error.message });
  }
},



deleteOffer: async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    // 1. Fetch the offer
    const offer = await exchangeOfferService.getOfferById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // 2. Authorization: only the user who made the offer can delete it
    if (offer.offeredBy._id.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this offer.' });
    }

    // 3. Only allow deleting if offer is still pending
    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Cannot delete an offer that is already ${offer.status}.` });
    }

    // 4. Delete the offer
    await exchangeOfferService.deleteOffer(offerId);

    res.status(204).send();
  } catch (error) {
    console.error("Delete offer error:", error);
    res.status(500).json({ message: error.message });
  }
},




};

export default exchangeOfferController;
