import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_FOLDER = "nodejs-20250302";

async function uploadFile(files) {
  const uploadResults = [];

  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          type: 'upload',
        },
        (error, data) => {
          if (error) return reject(error);
          resolve(data);
        }
      );

      uploadStream.end(file.buffer); // ✅ Use .end() here
    });

    console.log('✅ Uploaded to Cloudinary:', result.secure_url); // ✅ Now this is in scope
    uploadResults.push(result);
  }

  return uploadResults;
}

export default uploadFile;
