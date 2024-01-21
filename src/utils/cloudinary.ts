import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import env from "dotenv";
import { error } from "console";
env.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload_cloudinary = async (filePath: string, folderPath: string) => {
  try {
    const uploadInstance = await cloudinary.uploader.upload(filePath, {
      folder: folderPath,
    });
    fs.unlinkSync(filePath);
    return uploadInstance;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(filePath);
    return null;
  }
};

const delete_cloudinary = async (public_id: string) => {
  try {
    const deleteInstance = await cloudinary.uploader.destroy(
      public_id,
      (error, result) => {
        if (error) throw new Error("failed to delete image from cloudinary!");
        return result;
      }
    );
    return deleteInstance;
  } catch (error) {
    return null;
  }
};

export { upload_cloudinary, delete_cloudinary };
