const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;


// const { v2: cloudinary } = require("cloudinary");
// const fs = require("fs");

// const uploadOnCloudinary = async(filePath)=>{
//     cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//         api_key: process.env.CLOUDINARY_API_KEY, 
//         api_secret: process.env.CLOUDINARY_API_SECRET  
//     });
//     try {
//         const uploadResult = await cloudinary.uploader.upload(filePath)
//         fs.unlinkSync(filePath) // after upload the image on the cloundary we are deleting the image from the the public folder which we are store temporary by the help of multer middleware 
//         return uploadResult.secure_url // in the uploadResult there are multiple data has been come, we want only url of the image that why we are using secure_url
    
//     } catch (error) {
//         if(filePath)  fs.unlinkSync(filePath);
//         throw new Error ("Cloudinary upload failed");
//     }
// }

// module.exports = uploadOnCloudinary