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
  const createdByObj = data.createdBy && typeof data.createdBy === 'object' ? data.createdBy : {};

  return {
    id: data._id,
    _id: data._id,
    name: data.name,
    description: data.description,
    price: data.price,
    brand: data.brand,
    category: data.category,
    imageUrls: data.imageUrls,
    imagePublicIds: data.imagePublicIds,
    createdBy: createdByObj._id || data.createdBy || null,
    createdAt: data.createdAt,
    ownerPhone: createdByObj.phone || null,
  };
}



