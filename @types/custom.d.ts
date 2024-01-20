import { Request } from "express";
import { IUser } from "../src/models/user.model";

export interface IGetUserInterfaceRequst extends Request {
    user?: IUser;
}