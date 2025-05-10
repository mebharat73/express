import express from "express";

import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import { ROLE_ADMIN } from "../constants/roles.js";
import {
  checkoutOrder,
  confirmOrder,
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// /api/orders
router.get("/", auth, roleBasedAuth(ROLE_ADMIN), getAllOrders);

router.get("/user/:userId", auth, getOrdersByUser);

router.get("/:id", auth, getOrderById);

router.post("/", auth, createOrder);

router.put("/:id/status", auth, roleBasedAuth(ROLE_ADMIN), updateOrderStatus);

router.put("/:id/checkout", auth, checkoutOrder);

router.put("/:id/confirm", auth, confirmOrder);

router.delete("/:id", auth, roleBasedAuth(ROLE_ADMIN), deleteOrder);

export default router;
