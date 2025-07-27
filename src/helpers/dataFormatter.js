export function formatUserData(data) {
  return {
    address: data?.address,
    createdAt: data.createdAt,
    email: data.email,
    id: data._id,
    name: data.name,
    phone: data.phone,
    profileImageUrl: data.profileImageUrl,
    roles: data.roles,
  };
}

export function formatProductData(data) {
  return {
    brand: data.brand,
    category: data.category,
    createdAt: data.createdAt,
    description: data.description,
    id: data._id,
    _id: data._id, // for backend use if needed
    imageUrls: data.imageUrls,
    name: data.name,
    price: data.price,
    createdBy: data.createdBy?._id || data.createdBy || null, // <-- add this line
  };
}
