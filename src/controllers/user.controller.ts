import { Response } from "express";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import { IUserWithAvatar, UserModel } from "../models/user.model";
import { delete_cloudinary, upload_cloudinary } from "../utils/cloudinary";
import { ImageModel } from "../models/image.model";
import { matchedData, validationResult } from "express-validator";

const updateAvatar = async (req: IGetUserInterfaceRequst, res: Response) => {
  // grab new avatar
  const avatarPath = req.file?.path;
  if (!avatarPath)
    return res.status(404).json({ message: "Avatar not found!" });

  const user = req.user;
  try {
    const userData = (await UserModel.findById(user?._id).populate(
      "avatar"
    )) as IUserWithAvatar;

    // update new avatar in upload_cloudinary
    const uploadedAvatar = upload_cloudinary(
      avatarPath as string,
      process.env.AVATAR_FOLDER as string
    );
    const deletePrev = delete_cloudinary(userData.avatar.public_id);
    const [avatarResponse, deleteResponse] = await Promise.all([
      uploadedAvatar,
      deletePrev,
    ]);

    const image = await ImageModel.findOneAndUpdate(
      { _id: userData.avatar._id },
      {
        url: avatarResponse?.secure_url!,
        public_id: avatarResponse?.public_id!,
      },
      { new: true }
    );
    if (!image)
      return res.status(400).json({ message: "avatar update failed" });

    return res.status(200).json({
      message: "avatar update successful!",
      avatar: avatarResponse?.url,
    });
    //success - delete previous avatar from cloudinary
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Internal server error to update avatar!" });
  }
};

const updatePassword = async (req: IGetUserInterfaceRequst, res: Response) => {
  // grab passwords
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json(errors);

  const user = req.user;
  const passwords = matchedData(req) as {
    current_password: string;
    confirm_password: string;
  };

  try {
    const userData = await UserModel.findById(user?._id);
    if (!userData) return res.status(404).json({ message: "invalid!" });
    const isValidPass = userData?.isPasswordValid(passwords.current_password);
    if (!isValidPass) return res.status(400).json({ message: "invalid!" });

    userData.password = passwords.confirm_password;
    const updatedPassword = await userData.save();
    
    if(!updatedPassword) return res.status(400).json({message: "password change failed!"});
    return res.status(200).json({
      message: "password update successful!"
    });
    //success - delete previous avatar from cloudinary
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error to update avatar!" });
  }
};
export { updateAvatar, updatePassword };
