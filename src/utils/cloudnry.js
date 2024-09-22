import { v2 as cloudinary } from 'cloudinary';
import fs  from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME , 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
})



const uploadCloudinary = async (localFilePath) => {
       try {
        if (!localFilePath) return null

        const  response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'auto'
         })
  
         console.log("filw  is uploaded :",response.url );
         return response
       } catch (error) {
           fs.unlinkSync(localFilePath)
       }
}
// const uploadResult = await cloudinary.uploader
// .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
// )
// .catch((error) => {
//     console.log(error);
// });
