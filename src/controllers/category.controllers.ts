import { Request, Response } from "express";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import { matchedData, validationResult } from "express-validator";
import { CategoryModel, ICategoryPopulate } from "../models/category.model";
import { delete_cloudinary, upload_cloudinary } from "../utils/cloudinary";
import { ImageModel } from "../models/image.model";
import mongoose from "mongoose";
import fs from "fs";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

const createCategory = async (req: IGetUserInterfaceRequst, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors);
  const JWTUser = req.user;
  const iconPath = req.file?.path;
  const data = matchedData(req);

  try {
    // check that category exist or not
    // create category
    // upload icon in cloudinary
    // create an image with icon data from cludinary
    // modify category with icon (in image model) _id
    // save category

    const isExist = await CategoryModel.findOne({ title: data.title });
    if (isExist) {
      fs.unlinkSync(iconPath!);
      return res
        .status(409)
        .json(new ApiError(409, "Category Already Exists!"));
    }
    const category = await CategoryModel.create({
      title: data.title,
      author: JWTUser?._id,
    });

    // upload icon in cloudinary
    const uploadedIcon = await upload_cloudinary(
      iconPath!,
      process.env.ICON_FOLDER!
    );
    // clear icon from local directory
    if (fs.existsSync(iconPath!)) {
      fs.unlinkSync(iconPath!);
    }

    // save icon in DB
    const image = await ImageModel.create({
      public_id: uploadedIcon?.public_id,
      url: uploadedIcon?.secure_url,
    });
    // save icon id in category
    category.icon = image._id as unknown as mongoose.Types.ObjectId;
    await category.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, "Category Created Successfuly!", { category })
      );
  } catch (error) {
    fs.unlinkSync(iconPath!);
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
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(new ApiError(500, "Internal server error from create category!"));
    }
  }
};

const getCategory = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find();
    if (!categories)
      return res.status(404).json(new ApiError(404, "Category Not Found!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "category founded!", { categories }));
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error in get category section",
      ok: false,
    });
  }
};

const getSingleCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id;

  try {
    const category = await CategoryModel.findById(categoryId);
    if (!category)
      return res.status(404).json(new ApiError(404, "Category not Found!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Category Founded!", { category }));
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
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(new ApiError(500, "Internal server error from login user!"));
    }
  }
};

const updateCategoryTitle = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors);
  const data = matchedData(req);
  const { id } = req.params;

  try {
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { _id: id },
      { $set: { title: data.title } },
      { new: true }
    );
    if (!updatedCategory)
      return res
        .status(403)
        .json(new ApiError(403, "Category Title Update Failed!"));

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Category Title Updated", { updatedCategory })
      );
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
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(new ApiError(500, "Internal server error from login user!"));
    }
  }
};

const updateCategoryIcon = async (req: Request, res: Response) => {
  const iconPath = req.file?.path;
  const { id } = req.params;

  try {
    // upload new icon in cloudinary and delete previous one
    const category = (await CategoryModel.findById(id).populate(
      "icon"
    )) as ICategoryPopulate;
    if (!category)
      return res.status(404).json(new ApiError(404, "Category Not Found!"));

    const uploadIcon = upload_cloudinary(iconPath!, process.env.ICON_FOLDER!);
    const deletePrevIcon = delete_cloudinary(category?.icon.public_id);

    const [uploadedIcon, deletedIcon] = await Promise.all([
      uploadIcon,
      deletePrevIcon,
    ]);

    if (!uploadedIcon)
      return res.status(403).json(new ApiError(403, "Failed to Change Icon!"));

    category.icon.url = uploadedIcon.secure_url;
    category.icon.public_id = uploadedIcon.public_id;

    const updatedCategory = await category.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Category Icon Update Successfuly!", {
          updatedCategory,
        })
      );
  } catch (error) {
    if (fs.existsSync(iconPath!)) {
      fs.unlinkSync(iconPath!);
    }
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
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else if ((error as any).code === 11000 || (error as any).code === 11001) {
      return res.status(400).json(new ApiError(400, (error as any).message));
    } else {
      return res
        .status(500)
        .json(new ApiError(500, "Internal server error from login user!"));
    }
  }
};

export {
  createCategory,
  getCategory,
  getSingleCategory,
  updateCategoryIcon,
  updateCategoryTitle,
};
