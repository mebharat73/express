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
    // Get existing product from DB
    const product = await productService.getProductById(id);
    if (!product) return res.status(404).send("Product not found.");

    // Authorization check
    if (product.createdBy.toString() !== user.id && !user.roles.includes(ROLE_ADMIN)) {
      return res.status(403).send("Access denied");
    }

    // Parse and validate existing images
    let existingImageUrls = [];
    if (input.existingImages) {
      try {
        existingImageUrls = JSON.parse(input.existingImages);
      } catch (err) {
        return res.status(400).json({ message: "Invalid format for existingImages" });
      }
    }

    // Upload new images
    let uploadedImageUrls = [];
    if (files?.length) {
      const uploadResults = await uploadFile(files); // should return [{ secure_url }]
      uploadedImageUrls = uploadResults.map(result => result.secure_url || result.url);
    }

    // Identify and remove old images from Cloudinary
    const removedImages = product.imageUrls.filter(url => !existingImageUrls.includes(url));
    await Promise.all(
      removedImages.map(async (url) => {
        const filenameWithExt = url.split('/').pop();
        const publicId = `${CLOUDINARY_FOLDER}/${filenameWithExt.split('.')[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        } catch (err) {
          console.warn(`Failed to delete image ${publicId}:`, err.message);
        }
      })
    );

    // Combine final image list
    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    // Filter and cast allowed fields
    const allowedFields = ['title', 'name', 'price', 'stock', 'brand', 'category', 'description'];
    const cleanedData = {};
    allowedFields.forEach(field => {
      if (input[field] !== undefined) {
        if (['price', 'stock'].includes(field)) {
          cleanedData[field] = parseFloat(input[field]); // Ensure proper number type
        } else {
          cleanedData[field] = input[field];
        }
      }
    });

    cleanedData.imageUrls = finalImageUrls;
    cleanedData.updatedAt = new Date();

    // Final log before saving
    console.log("Updating product with data:", cleanedData);

    // Update DB
    const data = await productService.updateProduct(id, cleanedData);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in updateProduct:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).send("Internal Server Error");
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
