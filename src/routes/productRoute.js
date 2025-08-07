import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getCategories,
  getProductById,
  getProductsByUser,
  updateProduct,
  getProductsByCategory,
  getProductsByBrand,
  getBrands,
  getProductContact, 
} from "../controllers/productController.js";
import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import { ROLE_ADMIN, ROLE_MERCHANT } from "../constants/roles.js";

const router = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });


/**
 * URL: /api/products
 * Method: GET
 * Get all products
 */
router.get("/", getAllProducts);

// /api/products/users
router.get("/users", auth, getProductsByUser);

router.get("/categories", getCategories);
router.get("/brands", getBrands);

router.get("/category/:category", getProductsByCategory);
router.get("/brand/:brand", getProductsByBrand);

/**
 * URL: /api/products/:id
 * Method: GET
 * Get product by id
 */
router.get("/:id", getProductById);

/**
 * URL: /api/products
 * Method: POST
 * Create product
 */
router.post("/", auth, roleBasedAuth(ROLE_MERCHANT), upload.array('imageFiles', 5), createProduct);


/**
 * URL: /api/products/:id
 * Method: PUT
 * Update product
 */
router.put("/:id", auth, roleBasedAuth(ROLE_MERCHANT), upload.array('imageFiles', 5), updateProduct);




/**
 * URL: /api/products/:id
 * Method: DELETE
 * Delete product
 */
router.delete("/:id", auth, deleteProduct);

// ✅ Add contact route BEFORE `/:id`
router.get("/:id/contact", getProductContact); // <-- correct position

router.post('/:id/rate', auth, async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  if (value < 1 || value > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingRating = product.ratings.find(
      (rating) => rating.userId.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.value = value;
    } else {
      product.ratings.push({ userId: req.user._id, value });
    }

    await product.save();

    return res.status(200).json({
      message: "Rating submitted successfully",
      averageRating: product.averageRating,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error submitting rating" });
  }
});


export default router;
