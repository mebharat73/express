import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_FOLDER = "nodejs-20250302";

async function uploadFile(files) {
  const uploadResults = [];

  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          resource_type: 'image',
          use_filename: true, // Optional: uses original filename
          unique_filename: true, // Ensures no name collision
          type: 'upload',
        },
        (error, data) => {
          if (error) return reject(error);
          resolve(data);
        }
      )

        .end(file.buffer);
        console.log('✅ Uploaded to Cloudinary:', result.secure_url);

    });

    uploadResults.push(result);
  }

  return uploadResults;
}

export default uploadFile;
