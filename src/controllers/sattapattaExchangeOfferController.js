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


  // controllers/sattapattaExchangeOfferController.js

  getExchangeItemIds: async (req, res) => {
    try {
      const itemIds = await exchangeOfferService.getExchangeItemIds();
      res.json(itemIds);
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
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Ensure offered item and its owner exist
    const itemOffered = offer.itemOffered;
    const itemOwner = itemOffered?.owner;

    const itemOwnerId =
      typeof itemOwner === 'object' && itemOwner !== null
        ? itemOwner._id?.toString?.()
        : typeof itemOwner === 'string'
        ? itemOwner
        : null;

    if (!itemOwnerId || itemOwnerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    // Update offer and item statuses
    await exchangeOfferService.updateOffer(offerId, { status: 'accepted' });
    await SattapattaItem.findByIdAndUpdate(itemOffered?._id, { status: 'exchanged' });
    await SattapattaItem.findByIdAndUpdate(offer.itemRequested?._id, { status: 'exchanged' });

    // Email
    const requester = offer.offeredBy;
    const owner = itemOffered?.owner;

    // 🔒 Safe email send
    try {
      if (requester?.email && owner?.name && owner?.email) {
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
      } else {
        console.warn('Incomplete data for sending email:', { requester, owner });
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Don't throw - let the flow continue
    }

    // ✅ Return full data
    res.json({
      _id: offer._id,
      status: 'accepted',
      fromUserId: requester?._id,
      fromUserName: requester?.name,
      offeredProductTitle: offer.itemRequested?.title,
      requestedProductTitle: itemOffered?.title,
      additionalPrice: offer.extraPrice,
      offeredItemOwnerId: owner?._id,
      offeredItemOwnerEmail: owner?.email,
      offeredItemOwnerPhone: owner?.phone,
    });

  } catch (error) {
    console.error('❌ Error accepting offer:', error);
    res.status(500).json({ message: 'Failed to accept offer. Please try again.' });
  }
},









rejectOffer: async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    // 1. Fetch the offer with necessary population
    const offer = await exchangeOfferService.getOfferById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // 2. Validate itemOffered and owner presence
    if (!offer.itemOffered || !offer.itemOffered.owner) {
      return res.status(400).json({ message: 'Invalid offer: offered item or owner missing' });
    }

    // 3. Extract owner ID safely
    const itemOwnerRaw = offer.itemOffered.owner;
    const itemOwnerId =
      typeof itemOwnerRaw === 'object' && itemOwnerRaw !== null
        ? itemOwnerRaw._id?.toString?.()
        : typeof itemOwnerRaw === 'string'
        ? itemOwnerRaw
        : null;

    if (!itemOwnerId || itemOwnerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to reject this offer' });
    }

    // 4. Ensure offer is still pending
    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    // 5. Update status to rejected
    await exchangeOfferService.updateOffer(offerId, { status: 'rejected' });

    // 6. Attempt to notify requester via email
    const requester = offer.offeredBy;
    const owner = offer.itemOffered.owner;

    try {
      if (requester?.email && owner?.name && owner?.email) {
        await sendEmail(requester.email, {
          subject: "ℹ️ Your Sattapatta Exchange Offer Was Not Accepted",
          body: `
            <p>Your exchange offer was <strong>not accepted</strong> by the item owner.</p>
            <p>Here are the contact details of the item owner, in case you’d like to follow up:</p>
            <ul>
              <li><strong>Name:</strong> ${owner.name}</li>
              <li><strong>Email:</strong> ${owner.email}</li>
              <li><strong>Phone:</strong> ${owner.phone || 'Not provided'}</li>
            </ul>
            <p>You can continue browsing other items and make more offers.</p>
            <p>Thank you for using <strong>Sattapatta</strong>!</p>
          `
        });
      } else {
        console.warn('Incomplete data for sending rejection email:', { requester, owner });
      }
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr.message);
      // Email failure should not block the rejection process
    }

    // 7. Return success response
    res.json({ message: 'Offer rejected successfully' });

  } catch (error) {
    console.error('❌ Error rejecting offer:', error);
    res.status(500).json({ message: 'Failed to reject offer. Please try again.' });
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

    // 2. Check if user is involved in the offer
    const isInvolved = [
      offer.offeredBy?._id?.toString(),
      offer.itemOffered?.owner?._id?.toString(),
      offer.itemRequested?.owner?._id?.toString()
    ].includes(userId);

    if (!isInvolved) {
      return res.status(403).json({
        message: 'You are not authorized to delete this offer.'
      });
    }

    // 3. Handle deletion based on status
    const { status, createdAt } = offer;
    const now = new Date();
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;

    if (status === 'pending' || status === 'rejected') {
      await exchangeOfferService.deleteOffer(offerId);
      return res.status(204).send();
    }

    if (status === 'accepted') {
      const createdDate = new Date(createdAt);
      if (now - createdDate >= oneMonthInMs) {
        await exchangeOfferService.deleteOffer(offerId);
        return res.status(204).send();
      } else {
        return res.status(403).json({
          message: "You can't delete the offer currently because your offer is accepted.You can delete it after 1 month"
        });
      }
    }

    // Fallback (shouldn't happen)
    return res.status(400).json({ message: 'Invalid offer status.' });

  } catch (error) {
    console.error("Delete offer error:", error);
    res.status(500).json({ message: error.message });
  }
},






};

export default exchangeOfferController;
