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

export function formatProductData(data, userId = null) {
  let userRating = 0;

  if (userId && data.ratings && Array.isArray(data.ratings)) {
    const found = data.ratings.find(
      (r) => r.userId.toString() === userId.toString()
    );
    if (found) {
      userRating = found.value;
    }
  }

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
    createdBy: data.createdBy?._id || data.createdBy || null,
    createdAt: data.createdAt,
    rating: data.averageRating || 0,        // Optional: if you calculate average in model
    userRating,                             // ✅ Include the user's rating
  };
}


