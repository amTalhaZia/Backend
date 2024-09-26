import { v2 as cloudinary } from 'cloudinary';
import fs  from "fs"
import dotenv from "dotenv";

dotenv.config();


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY ,
  api_secret: process.env.API_SECRET,
})

// console.log("Cloudinary config:", process.env.CLOUD_NAME, process.env.API_KEY, process.env.API_SECRET);




const uploadCloudinary = async (localFilePath) => {
  try {
      if (!localFilePath) return null;

      const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'auto',
      });

      // Check if the file exists before attempting to delete
      if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
      }

      return response;
  } catch (error) {
      console.log("cloudinary error", error.message);

      // Ensure we attempt to unlink only if the file exists
      if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
      }

      return null;
  }
};

// const uploadResult = await cloudinary.uploader
// .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
// )
// .catch((error) => {
//     console.log(error);
// });


export {uploadCloudinary}