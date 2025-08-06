// Database related tasks
import Product from "../models/Product.js";
import uploadFile from "../utils/file.js";
import promptGemini from "../utils/gemini.js";
import { formatProductData } from "../helpers/dataFormatter.js";

// 1. Sort: {fieldName:ORDER} for e.g {price: -1} 1: ASC | -1: DESC
// 2. Limit: Max no. of items

const getAllProducts = async (query, userId) => {
  const sort = JSON.parse(query.sort || "{}");
  const limit = parseInt(query.limit) || 12;
  const offset = parseInt(query.offset) || 0;
  const filters = {};

  const { category, brands, name, min, max } = query;

  if (category) filters.category = category;

  if (brands) {
    const brandItems = brands.split(",").filter(Boolean);
    if (brandItems.length > 0) {
      filters.brand = { $in: brandItems };
    }
  }

  if (name) {
    filters.name = { $regex: name, $options: "i" };
  }

  if (min || max) {
  filters.price = {};

  const minVal = parseFloat(min);
  if (!isNaN(minVal)) filters.price.$gte = minVal;

  const maxVal = parseFloat(max);
  if (!isNaN(maxVal)) filters.price.$lte = maxVal;

  if (Object.keys(filters.price).length === 0) delete filters.price;
}

  if (userId) filters.createdBy = userId;

  console.log("Filters applied:", filters);

  const products = await Product.find(filters)
    .sort(sort)
    .limit(limit)
    .skip(offset);

  return products;
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate('createdBy', '_id');

  return formatProductData(product);
};


const createProduct = async (data, files, userId) => {
  const uploadedFiles = await uploadFile(files); // returns array of { secure_url, public_id }

  const geminiResponse = await promptGemini(data);

  return await Product.create({
    ...data,
    description: geminiResponse,
    createdBy: userId,
    imageUrls: uploadedFiles.map(file => file.secure_url),      // ✅ keep secure URLs
    imagePublicIds: uploadedFiles.map(file => file.public_id),  // ✅ store public IDs
  });
};


const updateProduct = async (id, data, files) => {
  let uploadedFiles = [];

  if (files && Array.isArray(files) && files.length > 0) {
    uploadedFiles = await uploadFile(files);
  }

  const updateFields = {
    ...data,
  };

  // Only update imageUrls if new images were uploaded
  if (uploadedFiles.length > 0) {
    updateFields.imageUrls = uploadedFiles.map((item) => item?.url);
  }

  return await Product.findByIdAndUpdate(id, updateFields, { new: true });
};



const deleteProduct = async (id) => {
  await Product.findByIdAndDelete(id);
};

const getCategories = async () => {
  return await Product.distinct("category");
};

const getBrands = async () => {
  return await Product.distinct("brand");
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
};
