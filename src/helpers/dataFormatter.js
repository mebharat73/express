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
    id: data._id,
    _id: data._id, // Optional for backend/internal use
    name: data.name,
    description: data.description,
    price: data.price,
    brand: data.brand,
    category: data.category,
    imageUrls: data.imageUrls,
    imagePublicIds: data.imagePublicIds,
    createdAt: data.createdAt,
    createdBy: {
      id: data.createdBy?._id || data.createdBy || null,
      name: data.createdBy?.name || null,
      phone: data.createdBy?.phone || null,
    },
  };
}


