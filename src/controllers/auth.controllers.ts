import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import { UserModel } from "../models/user.model";
import { cookieOptions } from "../utils/cookieOptions";
import { upload_cloudinary } from "../utils/cloudinary";
import { ImageModel } from "../models/image.model";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import JWT, { JwtPayload } from 'jsonwebtoken'
import fs from "fs";
const registerUser = async (req: Request, res: Response) => {
  const userDataErrors = validationResult(req);
  if (!userDataErrors.isEmpty())
    res.status(404).json({ message: "data missing!", errors: userDataErrors });

  const userData = matchedData(req);
  const avatarPath = req.file?.path;
  const avatarFolder = process.env.AVATAR_FOLDER;

  try {
    // check user exist or not
    // set data to DB
    // create access token & refresh token
    // send refresh token to the data base,
    // send access token and refresh token to cookies
    // return user data

    const existUser = await UserModel.findOne({ email: userData?.email });
    if (existUser)
      return res
        .status(409)
        .json({ message: "User is already exist with this mail." });

    const user = await UserModel.create(userData);

    if (!user)
      return res.status(404).json({ message: "User registerd failed!" });
    // upload avatar
    const uploadedAvatar = await upload_cloudinary(avatarPath!, avatarFolder!);

    const avatar = await ImageModel.create({
      url: uploadedAvatar?.secure_url,
      public_id: uploadedAvatar?.public_id,
      cloudinaryPath: avatarFolder,
    });
    const userAvatarSet = await UserModel.findByIdAndUpdate(user._id,{
      $set:{avatar: avatar._id}
    })

    res
      .status(200)
      .json({ message: "User Registration Successful!", userId: userAvatarSet?._id });
  } catch (error) {
    fs.unlinkSync(avatarPath!);
    res.status(404).json(error);
  }
};

const loginUser = async (req: Request, res: Response) => {
  const userDataErrors = validationResult(req);
  if (!userDataErrors.isEmpty())
    return res.status(404).json({ message: "data missing!", errors: userDataErrors });

  try {
    const data = matchedData(req);
    const user = await UserModel.findOne({email: data.email}).populate("avatar");
    if(!user) return res.status(404).json({message: "wrong email credentials!"});

    const isValidPass = await user.isPasswordValid(data.password);

    if(!isValidPass) return res.status(404).json({message: "wrong pass credentials!"});

    // if successfull then login user
    // generate refresh token and access token,
    // send refresh token to the db
    // set cookie with refresh token and accessToken

    const access_token = user.generateAccessToken();
    const refresh_token = user.generateRefreshToken();

    user.refreshToken = refresh_token;
    const refreshTokenSet = await user.save();

    if (!refreshTokenSet)
      return res.status(404).json({ message: "failed to set refresh token!" });

    res.cookie("access_token", access_token, cookieOptions(15 * 60, 15 * 60));
    res.cookie(
      "refresh_token",
      refresh_token,
      cookieOptions(60 * 60 * 24 * 30, 60 * 60 * 24 * 30)
    );
    
    res
      .status(200)
      .json({ message: "User Logged In Successful!", userId: user._id });
    

  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const logOutUser = async (req: IGetUserInterfaceRequst, res: Response) => {
  // clear refresh token from DB
  // clear access and refresh tokens from cookies
  try {
    const JWTUser = req.user;
    const user = await UserModel.findByIdAndUpdate(JWTUser?._id,{$unset:{refreshToken: 1}},{new: true});
    if(!user) return res.status(404).json({message: "User not found!"});

    res.cookie("access_token", {}, cookieOptions(0, 0));
    res.cookie(
      "refresh_token",
      {},
      cookieOptions(0, 0)
    );
    
    res
      .status(200)
      .json({ message: "User Logged Out Successful!", userId: user._id });
    


  } catch (error) {
    
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
  const refreshToken = req.cookies?.refresh_token || req.headers.authorization?.replace("Bearer ","");
  if(!refreshToken) return res.status(404).json({message: "no token found!"});
  
  const decodeUserId = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
  if(!decodeUserId) return res.status(400).json({message: "invalid Token"});

  const user = await UserModel.findById(decodeUserId._id);
  if(!user) return res.status(404).json({message: "user not found!"});

  const isFreshToken = refreshToken === user.refreshToken;
  if(!isFreshToken) return res.status(404).json({message: "invalid token or token is used!"}); 

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;

  const resetRefreshToken = await user.save();
  if(!resetRefreshToken) return res.status(400).json({message: "token reset failed!"});

  res.cookie("access_token", newAccessToken, cookieOptions( 15 * 60, 15 * 60));

  res.cookie(
    "refresh_token",
    newRefreshToken,
    cookieOptions(60 * 60 * 24 * 30, 60 * 60 * 24 * 30)
  );
  
  res
    .status(200)
    .json({ message: "Refresh Token Regenerated successFully!", userId: user._id });

}

export { registerUser, loginUser, logOutUser, reGenerateRefreshToken };
