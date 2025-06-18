import mongoose from "mongoose";

const sattapattaExchangeOfferSchema = new mongoose.Schema({
  offeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemOffered: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SattapattaItem',
    required: true
  },
  offeredItemOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  itemRequested: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SattapattaItem',
    required: true
  },
  requestedItemOwnerId: { // ✅ New field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  extraPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('SattapattaExchangeOffer', sattapattaExchangeOfferSchema);
