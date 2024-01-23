import { Request, Response } from "express";
import { IGetUserInterfaceRequst } from "../../@types/custom.ts";
import { matchedData, validationResult } from "express-validator";
import { CategoryModel } from "../models/category.model.ts";
import { ProjectModel } from "../models/project.model.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { upload_cloudinary } from "../utils/cloudinary.ts";
import { ImageModel } from "../models/image.model.ts";
import fs from 'fs';

const createProject = async (req: IGetUserInterfaceRequst, res: Response) => {
  const errors =  validationResult(req);
  if(!errors.isEmpty()) return res.status(404).json(errors);
  
  const data = matchedData(req) as {title: string, category_id: string};

  const user = req.user;
  try {
    
    // check category is exist or not
    await CategoryModel.findById(data.category_id);
    
    // create project with name and category id
    const project = new ProjectModel({title: data.title, category: data.category_id, author: user?._id});
    await project.save();

    return res.status(201).json(new ApiResponse(201,"Project created!", project));
  
  } catch (error) {
    if(error instanceof ApiError){
      return res.status(error.statusCode).json({error: {
        errorCode : error.statusCode, message: error.message
      }});
    }else if((error as any).name === 'ValidationError'){
      return res.status(400).json(new ApiError(400,(error as any).message));
    } else if((error as any).code === 11000 || (error as any).code === 11001){
      return res.status(400).json(new ApiError(400, (error as any).message))
    }else if((error as any).name === 'CastError'){
      return res.status(400).json(new ApiError(400, (error as any).message))
    }else{
      return res.status(500).json({message: "Internal server error from create project!", error})
    }
  }
};


const uploadProjectImage = async(req: Request, res : Response) => {
  const projectId = req.params.id;
  const imagePath = req.file?.path
  try {
    const project = await ProjectModel.findById(projectId);
    // upload image
    const uploadedImage = await upload_cloudinary(imagePath!,process.env.PROJECT_IMAGE_FOLDER!);
    if(!uploadedImage) throw new ApiError(403, "Image Failed to Upload in Cloudinary.");

    const dbImage = await ImageModel.create({url: uploadedImage.secure_url, public_id: uploadedImage.public_id});

    project?.images.push(dbImage._id);

    await project?.save();

    
    if(fs.existsSync(imagePath!)){
      fs.unlinkSync(imagePath!);
    }
    return res.status(200).json(new ApiResponse(200, "Image Upload Successful!", {url:dbImage.url}))

  } catch (error) {
    // instance of ApiError
    // validationError
    // castError
    // DuplicateKeyError 11000 | 11001
    // interval error

    if(fs.existsSync(imagePath!)){
      fs.unlinkSync(imagePath!);
    }
    if(error instanceof ApiError){
      return res.status(error.statusCode).json(error);
    }else if((error as any).name === "ValidationError"){
      return res.status(400).json(new ApiError(400,(error as any).message));
    }else if((error as any).name === "CastError"){
      return res.status(404).json(new ApiError(404, (error as any).message));
    }else if((error as any).code === 11000 || (error as any).code === 11001){
      return res.status(400).json(new ApiError(400, (error as any).message))
    }else{
      return res.status(500).json(new ApiError(500, "Internal server error from upload project image!"))
    }
  }
}

const getProject = async (req: Request, res: Response) => {};
const getSingleProject = async (req: Request, res: Response) => {};
const updateProjectCategory = async (req: Request, res: Response) => {};
const updateProjectFiles = async (req: Request, res: Response) => {};
const updateProjectImages = async (req: Request, res: Response) => {};
const updateProjectTitle = async (req: Request, res: Response) => {};
const updateProjectDescription = async (req: Request, res: Response) => {};
const updateProjectStatus = async (req: Request, res: Response) => {};

export {
  createProject,
  uploadProjectImage,
  getProject,
  getSingleProject,
  updateProjectCategory,
  updateProjectDescription,
  updateProjectFiles,
  updateProjectImages,
  updateProjectStatus,
  updateProjectTitle,
};
