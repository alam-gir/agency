import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import { UserModel } from "../models/user.model";
import { cookieOptions } from "../utils/cookieOptions";
import { upload_cloudinary } from "../utils/cloudinary";
import { ImageModel } from "../models/image.model";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import JWT, { JwtPayload } from 'jsonwebtoken'
import fs from "fs";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

const registerUser = async (req: Request, res: Response) => {
  const userDataErrors = validationResult(req);
  if (!userDataErrors.isEmpty())
    res.status(404).json({ message: "data missing!", errors: userDataErrors });

  const userData = matchedData(req);
  const avatarFolder = process.env.AVATAR_FOLDER;

  try {
    // check user exist or not
    // set data to DB
    // create access token & refresh token
    // send refresh token to the data base,
    // send access token and refresh token to cookies
    // return user data

    const existUser = await UserModel.findOne({ email: userData?.email });
    if (existUser){
      return res
      .status(409)
      .json(new ApiError(409, "User Already Registered with This mail!"));
    }

    const user = await UserModel.create(userData);
    const user_data = await UserModel.findById(user._id).select("-password -refreshToken");
 
    res
      .status(201)
      .json(new ApiResponse(201, "User registered Successful!", {user: user_data}));

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

const loginUser = async (req: Request, res: Response) => {
  const userDataErrors = validationResult(req);
  if (!userDataErrors.isEmpty())
    return res.status(404).json({ message: "data missing!", errors: userDataErrors });

  try {
    const data = matchedData(req);

    const user = await UserModel.findOne({email: data.email}).populate("avatar");
    if(!user) return res.status(404).json(new ApiError(404, "Wrong credentials!"));

    const isValidPass = await user.isPasswordValid(data.password);

    if(!isValidPass) return res.status(404).json(new ApiError(404, "Wrong credentials!"));

    // if successfull then login user
    // generate refresh token and access token,
    // send refresh token to the db
    // set cookie with refresh token and accessToken

    const access_token = user.generateAccessToken();
    const refresh_token = user.generateRefreshToken();

    user.refreshToken = refresh_token;
    const refreshTokenSet = await user.save();

    res.cookie("access_token", access_token, cookieOptions(15 * 60, 15 * 60));
    res.cookie(
      "refresh_token",
      refresh_token,
      cookieOptions(60 * 60 * 24 * 30, 60 * 60 * 24 * 30)
    );
    
    res
      .status(200)
      .json(new ApiResponse(200, "Logged in successful!",{userToken: access_token}));

  } catch (error) {
    // instance of ApiError
    // validationError
    // castError
    // DuplicateKeyError 11000 | 11001
    // interval error

    if(error instanceof ApiError){
      return res.status(error.statusCode).json(error);
    }else if((error as any).name === "ValidationError"){
      return res.status(400).json(new ApiError(400,(error as any).message));
    }else if((error as any).name === "CastError"){
      return res.status(400).json(new ApiError(400, (error as any).message));
    }else if((error as any).code === 11000 || (error as any).code === 11001){
      return res.status(400).json(new ApiError(400, (error as any).message))
    }else{
      return res.status(500).json(new ApiError(500, "Internal server error from login user!"))
    }
  }
};

const logOutUser = async (req: IGetUserInterfaceRequst, res: Response) => {
  // clear refresh token from DB
  // clear access and refresh tokens from cookies
  try {
    const JWTUser = req.user;
    const user = await UserModel.findByIdAndUpdate(JWTUser?._id,{$unset:{refreshToken: 1}},{new: true});
    if(!user) return res.status(404).json(new ApiError(404, "User not found!"));

    res.cookie("access_token", {}, cookieOptions(0, 0));
    res.cookie(
      "refresh_token",
      {},
      cookieOptions(0, 0)
    );
    
    res
      .status(200)
      .json(new ApiResponse(200, "User Logout Successfuly!"));
    


  } catch (error) {
    // instance of ApiError
    // validationError
    // castError
    // DuplicateKeyError 11000 | 11001
    // interval error

    if(error instanceof ApiError){
      return res.status(error.statusCode).json(error);
    }else if((error as any).name === "ValidationError"){
      return res.status(400).json(new ApiError(400,(error as any).message));
    }else if((error as any).name === "CastError"){
      return res.status(400).json(new ApiError(400, (error as any).message));
    }else if((error as any).code === 11000 || (error as any).code === 11001){
      return res.status(400).json(new ApiError(400, (error as any).message))
    }else{
      return res.status(500).json(new ApiError(500, "Internal server error from login user!"))
    }
  }
}

const reGenerateRefreshToken = async(req: Request, res: Response) => {
  // get refresh token from cookies or header
  // decode user id
  // find user in db by id
  // check cookies token and db user token matched or not
  // not matched -> refresh token user or invalid
  // matched -> generate refresh token and access token
  // set refresh token to the DB
  // set cookies = refresh token and access token 
try {
    const refreshToken = req.cookies?.refresh_token || req.headers.authorization?.replace("Bearer ","");
    if(!refreshToken) return res.status(404).json(new ApiError(404, "No Refresh Token Found!"));
    
    const decodeUserId = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
    if(!decodeUserId) return res.status(400).json(new ApiError(400, "Invalid Token"));
  
    const user = await UserModel.findById(decodeUserId._id);
    if(!user) return res.status(404).json(new ApiError(404, "User Not Found!"));
  
    const isFreshToken = refreshToken === user.refreshToken;
    if(!isFreshToken) return res.status(404).json(new ApiError(404, "Invalid or Used Refresh Token!")); 
  
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
  
    user.refreshToken = newRefreshToken;
  
    const resetRefreshToken = await user.save();
    if(!resetRefreshToken) return res.status(400).json(new ApiError(400, "Token Reset Failed!"));
  
    res.cookie("access_token", newAccessToken, cookieOptions( 15 * 60, 15 * 60));
  
    res.cookie(
      "refresh_token",
      newRefreshToken,
      cookieOptions(60 * 60 * 24 * 30, 60 * 60 * 24 * 30)
    );
    
    res
      .status(200)
      .json(new ApiResponse(200, "Refresh Token Re-generated Successful!"));
  
} catch (error) {
  
}
}

export { registerUser, loginUser, logOutUser, reGenerateRefreshToken };
