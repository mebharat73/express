import { ROLE_ADMIN } from "../constants/roles.js";
import { formatProductData } from "../helpers/dataFormatter.js";
import productService from "../services/productService.js";
import Product from "../models/Product.js"
import uploadFile from '../utils/file.js'; // path to your uploadFile utility
const CLOUDINARY_FOLDER = "nodejs-20250302";


const getAllProducts = async (req, res) => {
  const products = await productService.getAllProducts(req.query);

  const formattedProducts = products.map((product) =>
    formatProductData(product)
  );

  res.json(formattedProducts);
};

const getProductsByUser = async (req, res) => {
  const products = await productService.getAllProducts(req.query, req.user.id);

  const formattedProducts = products.map((product) =>
    formatProductData(product)
  );

  res.json(formattedProducts);
};

const getProductById = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await productService.getProductById(id);

    if (!product) return res.status(404).send("Product not found.");

    res.json(formatProductData(product));
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const createProduct = async (req, res) => {
  const userId = req.user.id;
  const files = req.files;
  const input = req.body;

  try {
    const data = await productService.createProduct(input, files, userId);

    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const files = req.files;
  const input = req.body;

  try {
    // Step 1: Fetch existing product
    const product = await Product.findById(id);
if (!product) return res.status(404).json({ message: "Product not found." });


    // Step 2: Authorization
    const isOwner = product.createdBy.toString() === user.id;
    const isAdmin = user.roles.includes(ROLE_ADMIN);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Step 3: Parse existing image URLs (if provided)
    let existingImageUrls = [];
    try {
      if (input.existingImages) {
        existingImageUrls = Array.isArray(input.existingImages)
          ? input.existingImages
          : JSON.parse(input.existingImages);
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid format for existingImages" });
    }

    // Step 4: Upload new images to Cloudinary
    let uploadedImageUrls = [];
    if (files?.length > 0) {
      const uploadResults = await uploadFile(files); // expects [{ secure_url }]
      uploadedImageUrls = uploadResults.map(file => file.secure_url);
    }

    // Step 5: Identify and delete removed images from Cloudinary
    const removedImages = product.imageUrls.filter(url => !existingImageUrls.includes(url));
    await Promise.all(
      removedImages.map(async (url) => {
        const filename = url.split("/").pop().split(".")[0];
        const publicId = `${CLOUDINARY_FOLDER}/${filename}`;
        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
          console.log(`✅ Deleted: ${publicId}`);
        } catch (err) {
          console.warn(`⚠️ Failed to delete ${publicId}: ${err.message}`);
        }
      })
    );

    // Step 6: Combine final image URLs
    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    // Step 7: Update allowed fields
    const allowedFields = [
      "title", "name", "price", "stock", "brand", "category", "description"
    ];
    for (const field of allowedFields) {
      if (input[field] !== undefined) {
        product[field] = ["price", "stock"].includes(field)
          ? parseFloat(input[field])
          : input[field];
      }
    }

    product.imageUrls = finalImageUrls;
    product.updatedAt = new Date();

    // Step 8: Save and respond
    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });

  } catch (error) {
    console.error("❌ Error in updateProduct:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  try {
    // Step 1: Fetch the product by ID
    const product = await productService.getProductById(id);

    // Check if product exists
    if (!product) return res.status(404).send("Product not found.");

    // Step 2: Check ownership or admin role
    if (product.createdBy.toString() !== user.id && !user.roles.includes("ADMIN")) {
      return res.status(403).send("Access denied");
    }

    // Step 3: Delete product images from Cloudinary (aligned with deleteItem)
    if (product.imageUrls && product.imageUrls.length > 0) {
      const deletePromises = product.imageUrls.map(async (url) => {
        try {
          const parts = url.split('/');
          const filenameWithExt = parts[parts.length - 1]; // Extract filename with extension
          const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`; // Use this to form publicId

          if (!publicId) {
            console.warn("⚠️ Skipping image deletion due to missing publicId for:", url);
            return;
          }

          // Call Cloudinary's destroy method to delete the image
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
          console.log(`✅ Deleted image: ${publicId}`);
        } catch (err) {
          console.warn(`⚠️ Failed to delete image for URL: ${url}`, err.message);
        }
      });

      // Wait for all image deletion promises to complete
      await Promise.all(deletePromises);
    }

    // Step 4: Delete product from database
    await productService.deleteProduct(id);

    // Send success response
    res.send(`Product deleted successfully with ID: ${id}`);
  } catch (error) {
    console.error("❌ Error in deleteProduct:", error);
    res.status(500).send(error.message);
  }
};


const getCategories = async (req, res) => {
  const categories = await productService.getCategories();

  res.json(categories);
};

const getBrands = async (req, res) => {
  const brands = await productService.getBrands();

  res.json(brands);
};

const getProductsByCategory = async (req, res) => {
  const category = req.params.category;

  const products = await productService.getAllProducts({ category });

  const formattedProducts = products.map((product) =>
    formatProductData(product)
  );

  res.json(formattedProducts);
};

const getProductsByBrand = async (req, res) => {
  const brand = req.params.brand;

  const products = await productService.getAllProducts({ brands: brand });

  const formattedProducts = products.map((product) =>
    formatProductData(product)
  );

  res.json(formattedProducts);
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductsByUser,
  getBrands,
  getProductsByCategory,
  getProductsByBrand,
};
