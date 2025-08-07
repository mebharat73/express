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
  imagePublicIds: {
    type: [String], // ✅ This line is required for deletions
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      value: { type: Number, min: 1, max: 5 },
    }
  ],
});

// Virtual field to calculate average rating
productSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0; // Safeguard against empty ratings array
  const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0);
  return sum / this.ratings.length;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,  // Optional: hide __v field
});


const model = mongoose.model("Product", productSchema);

export default model;
