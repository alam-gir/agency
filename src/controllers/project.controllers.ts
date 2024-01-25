import { Request, Response } from "express";
import { IGetUserInterfaceRequst } from "../../@types/custom.ts";
import { matchedData, validationResult } from "express-validator";
import { CategoryModel } from "../models/category.model.ts";
import { ProjectModel } from "../models/project.model.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { delete_cloudinary, upload_cloudinary } from "../utils/cloudinary.ts";
import { ImageModel } from "../models/image.model.ts";
import fs from "fs";
import { FileModel } from "../models/file.model.ts";

const getAllProjects = async (req: Request, res: Response) => {
  let { page, limit } = req.query;
  const skip = Number(page) || 1  - 1 * Number(limit) || 0;
  const lim = Number(limit) || 3;
  try {
    // get all projects
    const projects = await ProjectModel.find().skip(skip).limit(lim)
      .populate("author", { name: 1, email: 1, role: 1 })
      .populate("category")
      .populate("files")
      .populate("images")
      .then((doc) => doc)
      .catch((err) => {
        console.log({ err });
        if (err) throw new ApiError(400, "failed to get all projects!");
      });

    if (!projects) throw new ApiError(404, "projects not found!");

    return res.status(200).json(new ApiResponse(200, "success", projects));
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        error: {
          errorCode: error.statusCode,
          message: error.message,
        },
      });
    } else if ((error as any).name === "ValidationError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).name === "CastError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json({
          message: "Internal server error from get All projects!",
          error,
        });
    }
  }
};
const getSingleProjects = async (req: Request, res: Response) => {};

const createProject = async (req: IGetUserInterfaceRequst, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors);

  const data = matchedData(req) as { title: string; category_id: string };

  const user = req.user;
  try {
    // check category is exist or not
    await CategoryModel.findById(data.category_id);

    // create project with name and category id
    const project = new ProjectModel({
      title: data.title,
      category: data.category_id,
      author: user?._id,
    });
    await project.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "Project created!", project));
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        error: {
          errorCode: error.statusCode,
          message: error.message,
        },
      });
    } else if ((error as any).name === "ValidationError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).name === "CastError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json({ message: "Internal server error from create project!", error });
    }
  }
};

const uploadProjectImage = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const imagePath = req.file?.path;
  try {
    const project = await ProjectModel.findById(projectId)
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(404, "Project found failed!");
      });
    if (!project) throw new ApiError(404, "project not found!");

    // upload image
    const uploadedImage = await upload_cloudinary(
      imagePath!,
      process.env.PROJECT_IMAGE_FOLDER!
    );
    if (!uploadedImage)
      throw new ApiError(403, "Image Failed to Upload in Cloudinary.");

    const dbImage = new ImageModel({
      url: uploadedImage.secure_url,
      public_id: uploadedImage.public_id,
    });
    await dbImage.save();

    project?.images.push(dbImage._id);
    await project!.save();

    if (fs.existsSync(imagePath!)) {
      fs.unlinkSync(imagePath!);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Image Upload Successful!", { url: dbImage.url })
      );
  } catch (error) {
    // instance of ApiError
    // validationError
    // castError
    // DuplicateKeyError 11000 | 11001
    // interval error

    if (fs.existsSync(imagePath!)) {
      fs.unlinkSync(imagePath!);
    }
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error);
    } else if ((error as any).name === "ValidationError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).name === "CastError") {
      return res.status(404).json(new ApiError(404, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(
          new ApiError(500, "Internal server error from upload project image!")
        );
    }
  }
};

const deleteProjectImage = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const imageId = req.body.imageId;
  try {
    if (!imageId || !projectId)
      throw new ApiError(400, "Image Id and Project Id is required!");
    // get the project

    const project = await ProjectModel.findById(projectId)
      .then((doc) => doc)
      .catch((err) => {
        if (err) {
          throw new ApiError(400, "project found failed!");
        }
      });
    if (!project) throw new ApiError(404, "project not found!");
    // get the image
    const image = await ImageModel.findById(imageId)
      .then((doc) => doc)
      .catch((err) => {
        if (err) {
          throw new ApiError(400, "image found failed!");
        }
      });
    if (!image) throw new ApiError(404, "image not found!");

    //image id remove from project
    await ProjectModel.findByIdAndUpdate(
      { _id: projectId },
      { $pull: { images: imageId } }
    ).catch((err) => {
      if (err) throw new ApiError(400, "failed to delete image from project!");
    });

    // remove from image model
    await ImageModel.deleteOne({ _id: imageId }).select({ public_id: 1 });

    // remove from cloudinary
    await delete_cloudinary(image!.public_id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Image deleted successfully!", image));
  } catch (error) {
    // instance of ApiError
    // validationError
    // castError
    // DuplicateKeyError 11000 | 11001
    // interval error

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error);
    } else if ((error as any).name === "ValidationError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).name === "CastError") {
      return res.status(404).json(new ApiError(404, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(
          new ApiError(500, "Internal server error from delete project image!")
        );
    }
  }
};

const uploadProjectFile = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const filePath = req.file?.path;
  try {
    const project = await ProjectModel.findById(projectId)
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(404, "Project found failed!");
      });
    if (!project) throw new ApiError(404, "project not found!");

    // upload file
    const uploadedFile = await upload_cloudinary(
      filePath!,
      process.env.PROJECT_FILE_FOLDER!,
      "raw"
    );
    if (!uploadedFile)
      throw new ApiError(403, "File Failed to Upload in Cloudinary.");

    const dbFile = new FileModel({
      url: uploadedFile.secure_url,
      public_id: uploadedFile.public_id,
    });
    await dbFile.save();

    project?.files.push(dbFile._id);
    await project!.save();

    if (fs.existsSync(filePath!)) {
      fs.unlinkSync(filePath!);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, "File Upload Successful!", { url: dbFile.url })
      );
  } catch (error) {
    // instance of ApiError
    // validationError
    // castError
    // DuplicateKeyError 11000 | 11001
    // interval error

    if (fs.existsSync(filePath!)) {
      fs.unlinkSync(filePath!);
    }
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error);
    } else if ((error as any).name === "ValidationError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).name === "CastError") {
      return res.status(404).json(new ApiError(404, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(
          new ApiError(500, "Internal server error from upload project file!")
        );
    }
  }
};

const deleteProjectFile = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const fileId = req.body.fileId;
  try {
    if (!fileId || !projectId)
      throw new ApiError(400, "File Id and Project Id is required!");
    // get the project

    const project = await ProjectModel.findById(projectId)
      .then((doc) => doc)
      .catch((err) => {
        if (err) {
          throw new ApiError(400, "project found failed!");
        }
      });
    if (!project) throw new ApiError(404, "project not found!");
    // get the file
    const file = await FileModel.findById(fileId)
      .then((doc) => doc)
      .catch((err) => {
        if (err) {
          throw new ApiError(400, "file found failed!");
        }
      });
    if (!file) throw new ApiError(404, "file not found!");

    //file id remove from project
    await ProjectModel.findByIdAndUpdate(
      { _id: projectId },
      { $pull: { files: fileId } }
    ).catch((err) => {
      if (err) throw new ApiError(400, "failed to delete file from project!");
    });

    // remove from file model
    await FileModel.deleteOne({ _id: fileId }).select({ public_id: 1 });

    // remove from cloudinary
    await delete_cloudinary(file!.public_id);

    return res
      .status(200)
      .json(new ApiResponse(200, "File deleted successfully!", file));
  } catch (error) {
    // instance of ApiError
    // validationError
    // castError
    // DuplicateKeyError 11000 | 11001
    // interval error

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error);
    } else if ((error as any).name === "ValidationError") {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).name === "CastError") {
      return res.status(404).json(new ApiError(404, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(
          new ApiError(500, "Internal server error from delete project file!")
        );
    }
  }
};
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
  deleteProjectImage,
  uploadProjectFile,
  deleteProjectFile,
  getAllProjects,
  getSingleProjects,
};
