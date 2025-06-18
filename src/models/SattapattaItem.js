// models/SattapattaItem.js
import mongoose from "mongoose";

const sattapattaItemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  imageUrls: [String],
  estimatedValue: Number,
  condition: { type: String, enum: ['new', 'used', 'old'], default: 'used' },
  status: { type: String, enum: ['available', 'exchanged'], default: 'available' }
}, { timestamps: true });

export default mongoose.model('SattapattaItem', sattapattaItemSchema);
