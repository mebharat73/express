import express from 'express';
import exchangeOfferController from '../controllers/sattapattaExchangeOfferController.js';
import auth from '../middlewares/auth.js'; // Import your existing auth middleware

const router = express.Router();

router.post('/', auth, exchangeOfferController.createOffer); // Apply auth middleware
router.get('/received', auth, exchangeOfferController.getOffersReceived);
router.get('/active-items', exchangeOfferController.getExchangeItemIds);


router.get('/', exchangeOfferController.getAllOffers); // No auth needed for getting all offers (public)
router.get('/my-offers', auth, exchangeOfferController.getOffersByOfferedBy); // Apply auth middleware
router.get('/item/:itemId', exchangeOfferController.getOffersByItem); // No auth needed for getting offers by item (public)
router.get('/:id', exchangeOfferController.getOfferById); // No auth needed for getting a single offer (public)
router.put('/:id', auth, exchangeOfferController.updateOffer); // Apply auth middleware
router.delete('/:id', auth, exchangeOfferController.deleteOffer); // Apply auth middleware

// Routes to accept or reject an offer
router.post('/:id/accept', auth, exchangeOfferController.acceptOffer); // Apply auth middleware
router.post('/:id/reject', auth, exchangeOfferController.rejectOffer); // Apply auth middleware

export default router;
