import express from "express";
import { homePage, productByIdPage, productsPage } from "../controllers/viewController.js";

const router = express.Router();

router.get("/home", homePage);

router.get("/products", productsPage);

router.get("/products/:id", productByIdPage);

export default router;
