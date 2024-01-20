
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../models/user.model";
import { IGetUserInterfaceRequst } from "../../@types/custom";

export const verifyJWT = async (
  req: IGetUserInterfaceRequst,
  res: Response,
  next: NextFunction
) => {
  // check access token have or not,
  // verify token
  // decode token
  // find user by token information
  // add user to request object
  // next();
  try {
    const token = req.cookies?.access_token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) return res.status(404).json({ message: "token not found!" });
    
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as IUser;

    if (!decodedToken)
      return res.status(404).json({ message: "unathorized user!" });

    const user = await UserModel
      .findById(decodedToken._id)
      .select("-password -refreshToken");

    if (!user) return res.status(404).json({ message: "user not found!" });

    req.user = user;

    next();
  } catch (error) {
    console.log(error)
    return res.status(404).json({ message: error });
  }
};
