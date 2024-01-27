import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import env from "dotenv";
import { error } from "console";
import mongoose from "mongoose";
import { IImage } from "../models/image.model";
import { FileModel, IFileSchema } from "../models/file.model";
import { IProject } from "../models/project.model";
import { IUserPopulate } from "../models/user.model";
env.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload_cloudinary = async (filePath: string, folderPath: string, resource_type: "image" | "video" | "raw" | "auto" | undefined = "image" ) => {
  try {
    const uploadInstance = await cloudinary.uploader.upload(filePath, {
      folder: folderPath,
      resource_type,
    });
    fs.unlinkSync(filePath);
    return uploadInstance;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(filePath);
    return null;
  }
};

 const upload_file_cloudinary = async (filePath: string, folderPath : string, resource_type: "image" | "video" | "raw" | "auto" | undefined = "image") =>{
    return new Promise((resolve, reject) =>{
      cloudinary.uploader.upload(filePath,{resource_type:resource_type, folder: folderPath}, (error, result) => {
        if(error) reject(error)
        else resolve(result);
      })
    })
 } 

const uploadToCloudinaryAndDB = async(Model: mongoose.Model<IFileSchema | IUserPopulate>,filePath: string, folder : string, resource_type :  "auto" | "image" | "video" | "raw" | undefined = "raw") => {
  // upload to cloudinary
  const cloud = await cloudinary.uploader.upload(filePath,{folder, resource_type: resource_type});
  const document = new Model({url : cloud.secure_url, public_id: cloud.public_id});
  await document.save();
  return document._id;
}

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



const delete_file_cludinary = async (public_id: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id,(error, result) => {
      if(error) reject(error);
      else resolve(result);
    })
  })
}
export { upload_cloudinary, delete_cloudinary, upload_file_cloudinary, delete_file_cludinary, uploadToCloudinaryAndDB };
