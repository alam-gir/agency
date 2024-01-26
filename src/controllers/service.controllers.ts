import { Response } from "express";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import { matchedData, validationResult } from "express-validator";
import { CategoryModel } from "../models/category.model";
import { ApiError } from "../utils/apiError";
import { IService, IServicePopulated, ServiceModel } from "../models/service.model";
import { delete_cloudinary, upload_cloudinary } from "../utils/cloudinary";
import { ImageModel } from "../models/image.model";
import { ApiResponse } from "../utils/apiResponse";
import { PackageModel } from "../models/package.model";

const createService = async (req: IGetUserInterfaceRequst, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors.array());

  const data = matchedData(req) as {
    title: string;
    description: string;
    short_description?: string;
    status?: string;
    category_id: string;
    package_ids: string[];
  };
  const iconPath = req.file?.path;
  const user = req.user;

  try {
    // check category is exist or not
    const category = await CategoryModel.findById(data.category_id)
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(404, "Category found failed!", err);
      });

    if (!category) throw new ApiError(404, "Category not found!");
    const package_ids: any[] = [];

    if (data.package_ids.length) {
      // check packages are exist or not
      const packages = await PackageModel.find({
        _id: { $in: data.package_ids },
      })
        .then((docs) => {
          package_ids.push(docs.map((doc) => doc._id));
          return docs;
        })
        .catch((err) => {
          console.log(err);
          if (err) throw new ApiError(404, "Packages found failed!");
        });

      if (!packages) throw new ApiError(404, "Packages not found!");
    }

    // upload icon to cloudinary
    const uploadedIcon = await upload_cloudinary(
      iconPath!,
      process.env.ICON_FOLDER!
    );

    // save icon details in DB
    const icon = await ImageModel.create({
      url: uploadedIcon!.secure_url,
      public_id: uploadedIcon!.public_id,
    })
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(500, "Icon save to db failed!", err);
      });

    // create service
    const service = await ServiceModel.create({
      title: data.title,
      description: data.description,
      short_description: data.short_description,
      status: data.status,
      icon: icon!._id,
      category: category._id,
      packages: [...package_ids!],
      author: user?._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Service created!", service));
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
      return res.status(500).json({
        message: "Internal server error from create service!",
        error: error,
      });
    }
  }
};

const updateService = async (req: IGetUserInterfaceRequst, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors.array());
  const service_id = req.params.id;

  const data = matchedData(req) as {
    title: string;
    description: string;
    short_description?: string;
    status?: string;
    category_id: string;
    package_ids: string[];
  };

  try {
    // check service is exist or not
    const service = await ServiceModel.findById(service_id)
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(400, "Service found failed!", err);
      });

    if (!service) throw new ApiError(404, "Service not found!");

    // check category is exist or not
    const category = await CategoryModel.findById(data.category_id)
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(404, "Category found failed!", err);
      });

    if (!category) throw new ApiError(404, "Category not found!");

    // rearrange package ids
    const package_ids = await Promise.all(data.package_ids.map(async(id) => {
      const pack = await PackageModel.findById(id);
      if(pack) return pack._id;
    }));
    
    // update service with new data
    service.title = data.title;
    service.description = data.description;

    if (data.short_description) {
      service.short_description = data.short_description;
    }

    if (data.status) {
      service.status = data.status;
    }
    service.category = category._id;

    service.packages = package_ids;

    // save service
    await service
      .save()
      .then((doc) => doc)
      .catch((err) => {
        console.error(err);
        if (err) throw new ApiError(500, "Service save failed!");
      });
      
    return res
      .status(201)
      .json(new ApiResponse(201, "Service updated!", service));
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
      console.log(error)
      return res.status(500).json({
        message: "Internal server error from create update!",
        error: error,
      });
    }
  }
};

const updateServiceIcon = async (
  req: IGetUserInterfaceRequst,
  res: Response
) => {
  const service_id = req.params.id;
  const iconPath = req.file?.path;

  try {
    // check service is exist or not
    const service = await ServiceModel.findById(service_id)
    .populate('icon')
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(400, "Service found failed!", err);
      }) as IServicePopulated;

    if (!service) throw new ApiError(404, "Service not found!");

    const old_icon = service.icon;

    // upload icon to cloudinary
    const uploadedIcon = await upload_cloudinary(
      iconPath!,
      process.env.ICON_FOLDER!
    );

    // save icon details in DB
    const icon = await ImageModel.create({
      url: uploadedIcon!.secure_url,
      public_id: uploadedIcon!.public_id,
    })
      .then((doc) => doc)
      .catch((err) => {
        if (err) throw new ApiError(500, "Icon save to db failed!", err);
      });

    // update service with new data
    service.icon = icon!._id;

    // save service
    const updatedService = await service
      .save()
      .then((doc) => doc)
      .catch((err) => {
        console.error(err);
        if (err) throw new ApiError(500, "Service save failed!");
      });

      // delete icon from cloudinary
      await delete_cloudinary(old_icon.public_id);

      // delete old icon docs from db
      await ImageModel.findByIdAndDelete(old_icon._id);

    return res
      .status(201)
      .json(new ApiResponse(201, "Service icon updated!", updatedService));
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
      return res.status(500).json({
        message: "Internal server error from service update icon!",
        error: error,
      });
    }
  }
};



export { createService, updateService, updateServiceIcon };
