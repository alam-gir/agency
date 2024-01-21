import { Request, Response } from "express";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import { matchedData, validationResult } from "express-validator";
import { CategoryModel, ICategoryPopulate } from "../models/category.model";
import { delete_cloudinary, upload_cloudinary } from "../utils/cloudinary";
import { ImageModel } from "../models/image.model";
import mongoose from "mongoose";
import fs from "fs";

const createCategory = async (req: IGetUserInterfaceRequst, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors);
  const JWTUser = req.user;
  const iconPath = req.file?.path;
  const data = matchedData(req);
  console.log({ data });
  console.log({ iconPath });
  try {
    // create category
    // upload icon in cloudinary
    // create an image with icon data from cludinary
    // modify category with icon (in image model) _id
    // save category

    const category = await CategoryModel.create({
      title: data.title,
      author: JWTUser?._id,
    });
    if (!category)
      return res.status(403).json({ message: "Failed to create category!" });

    // upload icon in cloudinary
    const uploadedIcon = await upload_cloudinary(
      iconPath!,
      process.env.ICON_FOLDER!
    );
    // save icon in DB
    const image = await ImageModel.create({
      public_id: uploadedIcon?.public_id,
      url: uploadedIcon?.secure_url,
    });
    // save icon id in category
    category.icon = image._id as unknown as mongoose.Types.ObjectId;
    await category.save();

    return res
      .status(200)
      .json({ message: "category created successful!", ok: true });
  } catch (error) {
    fs.unlinkSync(iconPath!);
    return res
      .status(500)
      .json({
        message: "Internal server error from create category section",
        error,
      });
  }
};

const getCategory = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find();
    if (!categories)
      return res
        .status(404)
        .json({ message: "categories not found!", ok: false });
    return res.status(200).json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Internal server error in get category section",
        ok: false,
      });
  }
};

const getSingleCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id;

  try {
    const categories = await CategoryModel.findById(categoryId);
    if (!categories)
      return res
        .status(404)
        .json({ message: "category not found!", ok: false });
    return res.status(200).json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Internal server error in get single category section",
        ok: false,
      });
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
        .json({ message: "category title change failed!", ok: false });

    return res.status(200).json({ ok: true, category: updatedCategory });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Internal server error in update category title section!",
        error,
      });
  }
};
const updateCategoryIcon = async (req: Request, res: Response) => {
  const iconPath = req.file?.path;
  const { id } = req.params;

  try {

    // upload new icon in cloudinary and delete previous one
    const category = await CategoryModel.findById(id).populate("icon") as ICategoryPopulate;
    if (!category)
      return res
        .status(403)
        .json({ message: "category not found!", ok: false });
        
    const uploadIcon = upload_cloudinary(iconPath!,process.env.ICON_FOLDER!);
    const deletePrevIcon = delete_cloudinary(category?.icon.public_id)

    const [uploadedIcon, deletedIcon] = await Promise.all([uploadIcon, deletePrevIcon]);

    if(!uploadedIcon) return res.status(404).json({ message: "failed to change icon!", ok : false});

    category.icon.url = uploadedIcon.secure_url;
    category.icon.public_id = uploadedIcon.public_id;

    const updatedCategory = await category.save();
    if(!updatedCategory) return res.status(403).json({message: "failed to updated category!", ok: false});

    return res.status(200).json({ ok: true, category: updatedCategory });
  } catch (error) {
    fs.unlinkSync(iconPath!);
    return res
      .status(500)
      .json({
        message: "Internal server error in update category title section!",
        error,
      });
  }
};

export {
  createCategory,
  getCategory,
  getSingleCategory,
  updateCategoryIcon,
  updateCategoryTitle,
};
