import mongoose from "mongoose";
import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
} from "../constants/orderStatus.js";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderItems: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    default: ORDER_STATUS_PENDING,
    enum: [
      ORDER_STATUS_PENDING,
      ORDER_STATUS_CONFIRMED,
      ORDER_STATUS_SHIPPED,
      ORDER_STATUS_DELIVERED,
    ],
  },
  shippingAddress: {
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "Nepal",
    },
    province: String,
    street: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const model = mongoose.model("Order", orderSchema);

export default model;
