import express from "express";
import {
  createMerchant,
  createUser,
  deleteUser,
  getAllCustomers,
  getAllUsers,
  getUserById,
  updateUser,
  uploadProfileImage,
} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import { ROLE_ADMIN, ROLE_MERCHANT } from "../constants/roles.js";

const router = express.Router();

// /api/users
router.post("/", createUser);

// /api/users/merchant
router.post("/merchant", auth, roleBasedAuth(ROLE_ADMIN), createMerchant);

// /api/users/:id
router.put("/:id", auth, roleBasedAuth(ROLE_ADMIN), updateUser);

// /api/users/:id
router.delete("/:id", auth, roleBasedAuth(ROLE_ADMIN), deleteUser);

router.get("/", auth, roleBasedAuth(ROLE_ADMIN), getAllUsers);

router.get("/customers", auth, roleBasedAuth(ROLE_MERCHANT), getAllCustomers);

router.get("/:id", auth, getUserById);

router.put("/profile/upload", auth, uploadProfileImage);

router.put("/:id/profile-image", auth, uploadProfileImage);

export default router;
