import mongoose from "mongoose";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../constants/regex.js";
import { ROLE_ADMIN, ROLE_MERCHANT, ROLE_USER } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
  address: {
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
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (value) => {
        return EMAIL_REGEX.test(value);
      },
      message: "Invalid email address",
    },
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  profileImageUrl: String,
  roles: {
    type: [String],
    default: [ROLE_USER],
    enum: [ROLE_USER, ROLE_ADMIN, ROLE_MERCHANT],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const model = mongoose.model("User", userSchema);

export default model;
