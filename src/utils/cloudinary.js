import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// console.log("Cloudinary ENV:", {
//   cloud: process.env.CLOUD_NAME,
//   key: process.env.API_KEY,
//   secret: process.env.API_SECRET ? "Loaded ✅" : "Missing ❌",
// });

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // console.log("File is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Error from cloudinary fail to upload", error);
    fs.unlinkSync(localFilePath); // remove the loaclly saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
