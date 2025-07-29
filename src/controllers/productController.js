import { ROLE_ADMIN } from "../constants/roles.js";
import { formatProductData } from "../helpers/dataFormatter.js";
import productService from "../services/productService.js";

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
    const product = await productService.getProductById(id);
    if (!product) return res.status(404).send("Product not found.");

    if (product.createdBy.toString() !== user.id && !user.roles.includes(ROLE_ADMIN)) {
      return res.status(403).send("Access denied");
    }

    // Handle existing images
    let existingImageUrls = [];
    try {
      existingImageUrls = input.existingImages ? JSON.parse(input.existingImages) : [];
    } catch (err) {
      return res.status(400).json({ message: "Invalid format for existingImages" });
    }

    // Upload new files if provided
    let uploadedImageUrls = [];
    if (files && files.length > 0) {
      const uploadResults = await uploadFile(files); // returns [{ secure_url, ... }]
      uploadedImageUrls = uploadResults.map(result => result.secure_url);
    }

    // Identify removed images (present before, now not included)
    const removedImages = product.imageUrls.filter(url => !existingImageUrls.includes(url));
    await Promise.all(
      removedImages.map(async (url) => {
        const filenameWithExt = url.split('/').pop();
        const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        } catch (error) {
          console.warn(`Failed to delete image ${publicId}:`, error.message);
        }
      })
    );

    // Final image list = kept + newly uploaded
    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    // Prepare the updated product data
    const updatedData = {
      ...input,
      imageUrls: finalImageUrls,
      updatedAt: new Date()
    };

    const data = await productService.updateProduct(id, updatedData);

    res.send(data);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).send(error.message);
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
