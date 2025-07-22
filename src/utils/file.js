import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_FOLDER = "nodejs-20250302";

async function uploadFile(files) {
  const uploadResults = [];

  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: CLOUDINARY_FOLDER,
            resource_type: 'auto',  // <-- Important!
            invalidate: true, // <--- add this
            type: 'upload' // ✅ Correct placement
          },
          (error, data) => {
            if (error) return reject(error);

            resolve(data);
          }
        )
        .end(file.buffer);
    });

    uploadResults.push(result);
  }

  return uploadResults;
}

export default uploadFile;
