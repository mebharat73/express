import { ROLE_ADMIN } from "../constants/roles.js";
import { formatProductData } from "../helpers/dataFormatter.js";
import productService from "../services/productService.js";
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
    // Get product from DB
    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    // Check permissions
    if (product.createdBy.toString() !== user.id && !user.roles.includes(ROLE_ADMIN)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Parse existing images
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

    // Upload new files to Cloudinary
    let uploadedImageUrls = [];
    if (files?.length) {
      const uploadResults = await uploadFile(files); // Should return [{ secure_url }]
      uploadedImageUrls = uploadResults.map(result => result.secure_url || result.url);
    }

    // Identify removed images
    const removedImages = product.imageUrls.filter(url => !existingImageUrls.includes(url));

    // Delete removed images from Cloudinary
    await Promise.all(
      removedImages.map(async (url) => {
        const filenameWithExt = url.split('/').pop();
        const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
          console.log(`✅ Deleted: ${publicId}`);
        } catch (err) {
          console.warn(`❌ Failed to delete ${publicId}: ${err.message}`);
        }
      })
    );

    // Final image list
    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    // Update fields safely
    const allowedFields = ['title', 'name', 'price', 'stock', 'brand', 'category', 'description'];
    allowedFields.forEach(field => {
      if (input[field] !== undefined) {
        if (['price', 'stock'].includes(field)) {
          product[field] = parseFloat(input[field]);
        } else {
          product[field] = input[field];
        }
      }
    });

    product.imageUrls = finalImageUrls;
    product.updatedAt = new Date();

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("❌ Error in updateProduct:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  try {
    const product = await productService.getProductById(id);

    if (!product) return res.status(404).send("Product not found.");

    // Check ownership or admin role
    if (product.createdBy.toString() !== user.id && !user.roles.includes("ADMIN")) {
      return res.status(403).send("Access denied");
    }

    await productService.deleteProduct(id);

    res.send(`Product delete successful of id: ${id}`);
  } catch (error) {
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
