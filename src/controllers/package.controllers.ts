import e, { Request, Response } from "express";
import { validationResult } from "express-validator";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import { ApiError } from "../utils/apiError";
import { CategoryModel } from "../models/category.model";
import { PackageModel } from "../models/package.model";
import { delete_cloudinary, upload_cloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/apiResponse";
import fs from "fs";
import { ImageModel } from "../models/image.model";

const createPackage = async (req: IGetUserInterfaceRequst, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors.array());
  const {
    title,
    price_bdt,
    price_usd,
    category_id,
    description,
    delivery_time,
    revision_time,
    features,
    status,
  } = req.body;
  const iconPath = req.file?.path;
  const user = req.user;

  try {
    // check icon path exists
    if (!iconPath) throw new ApiError(404, "icon is required");

    // check if category exists
    const category = await CategoryModel.findById(category_id)
      .then((doc) => doc)
      .catch((err) => {
        throw new ApiError(400, "failed to find category!");
      });
    if (!category) throw new ApiError(404, "category not found");

    // upload the icon to cloudinary
    const icon_cloudinary = await upload_cloudinary(
      iconPath,
      process.env.ICON_FOLDER!
    );

    // icon create in db
    const icon = await ImageModel.create({
      url: icon_cloudinary!.secure_url,
      public_id: icon_cloudinary!.public_id,
    });

    if (fs.existsSync(iconPath!)) {
      fs.unlinkSync(iconPath!);
    }

    // create the package
    const createdPackage = await PackageModel.create({
      title,
      price_bdt: Number(price_bdt),
      price_usd: Number(price_usd),
      category: category._id,
      description,
      delivery_time,
      revision_time: Number(revision_time),
      features: [...features],
      icon: icon._id,
      author: user?._id,
      status: status || "active"
    })

      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(400, "failed to create package");
      });

    // response with the package
    return res
      .status(201)
      .json(
        new ApiResponse(201, "package created succesfully!", {
          package: createdPackage,
        })
      );
  } catch (error) {
    if (fs.existsSync(iconPath!)) {
      fs.unlinkSync(iconPath!);
    }
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
        .json({ message: "Internal server error from create package!", error });
    }
  }
};

const updatePackageTitle = async (req: Request, res: Response) => {
  const package_id = req.params.id;
  const title = req.body.title;

  try {
    if (!package_id || !title)
      throw new ApiError(400, "Package Id and title is required!");

    const package_data = await PackageModel.findByIdAndUpdate(
      { _id: package_id },
      { title },
      { new: true }
    )
      .populate("author", { name: 1, email: 1, role: 1 })
      .populate("category")
      .populate("icon")
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(400, "Package update title failed!");
      });
    if (!package_data) throw new ApiError(404, "Package not found!");

    return res
      .status(200)
      .json(new ApiResponse(200, "Package title updated!", package_data));
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
          message: "Internal server error from package update title!",
          error,
        });
    }
  }
};

const updatePackageDescription = async (req: Request, res: Response) => {
    const package_id = req.params.id;
    const description = req.body.description;
  
    try {
      if(!package_id || !description) throw new ApiError(400,"package Id and description is required!");
  
      const package_data = await PackageModel.findByIdAndUpdate({_id: package_id},{description},{new: true})
      .populate("author", { name: 1, email: 1, role: 1 })
      .populate("category")
      .populate("icon")
      .then(doc => doc).catch(err => {
        if(err) throw new ApiError(400,"package update description failed!");
      });
      if(!package_data) throw new ApiError(404,"package not found!");
  
      return res.status(200).json(new ApiResponse(200,"package description updated!",package_data))
      
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
          .json({ message: "Internal server error from package update description!", error });
      }
    }
  }

const updatePackageStatus = async (req: Request, res: Response) => {
    const package_id = req.params.id;
    const status = req.body.status as "active" | "inactive";
  
    try {
      if(!package_id || !status) throw new ApiError(400,"Package Id and status is required!");
      if(status !== "inactive" && status !== "active") throw new ApiError(400,"Status must be active or inactive");
  
      const package_data = await PackageModel.findByIdAndUpdate({_id: package_id},{status},{new: true})
      .populate("author", { name: 1, email: 1, role: 1 })
      .populate("category")
      .populate("icon")
      .then(doc => doc).catch(err => {
        if(err) throw new ApiError(400,"Package update status failed!");
      });
      if(!package_data) throw new ApiError(404,"Package not found!");
  
      return res.status(200).json(new ApiResponse(200,"Package status updated!",package_data));
      
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
          .json({ message: "Internal server error from package update status!", error });
      }
    }
  }

const updatePackageIcon = async (req: Request, res: Response) => {
    const package_id = req.params.id;
    const iconPath = req.file?.path;
    try {
      const package_data = await PackageModel.findById(package_id)
        .then((doc) => doc)
        .catch((err) => {
          if (err) throw new ApiError(404, "Package found failed!");
        });
      if (!package_data) throw new ApiError(404, "package not found!");

      // get old icon
        const oldIcon = await ImageModel.findById(package_data.icon);

        //delete old Icon from  Db
        await ImageModel.deleteOne({_id: package_data.icon}).then(doc => doc).catch(err => {if(err) throw new ApiError(400, "Icon delete failed!")});

        // delete old icon from cloudinary
        const deletedIcon = await delete_cloudinary(oldIcon!.public_id).then(doc => doc).catch(err => {if(err) throw new ApiError(400, "Icon deleted from DB but failed to delete from cloudinary!")});
        
      // upload icon
      const newIcon = await upload_cloudinary(
        iconPath!,
        process.env.PROJECT_ICON_FOLDER!
      );

      if (!newIcon)
        throw new ApiError(403, "Icon Failed to Upload in Cloudinary.");
  
      const dbIcon = new ImageModel({
        url: newIcon.secure_url,
        public_id: newIcon.public_id,
      });

      await dbIcon.save();
  
      package_data.icon = dbIcon._id;
      await package_data!.save();
  
      if (fs.existsSync(iconPath!)) {
        fs.unlinkSync(iconPath!);
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Icon updated Successful!", { url: dbIcon.url })
        );
    } catch (error) {
      // instance of ApiError
      // validationError
      // castError
      // DuplicateKeyError 11000 | 11001
      // interval error
  
      if (fs.existsSync(iconPath!)) {
        fs.unlinkSync(iconPath!);
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
            new ApiError(500, "Internal server error from updated package Icon!")
          );
      }
    }
  };


export { createPackage, updatePackageTitle, updatePackageDescription, updatePackageStatus, updatePackageIcon };
