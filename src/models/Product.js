import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: String,
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    min: 0, // Optional: ensure stock can't be negative
    default: 0, // Optional: set a default value if you like
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  description: String,
  imageUrls: {
    type: [String],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const model = mongoose.model("Product", productSchema);

export default model;
