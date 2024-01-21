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
    const isValidPass = await userData?.isPasswordValid(passwords.current_password);
    if (!isValidPass) return res.status(400).json({ message: "invalid pass!" });

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

const updateEmail = async (req: IGetUserInterfaceRequst, res: Response) => {
  //get user,
  // new email and current password
  // current password validity
  // save email

  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(404).json(errors);
  const JWTUser = req.user;
  const data = matchedData(req) as {email: string, current_password: string};
  try {
    const user = await UserModel.findById(JWTUser?._id);
    const isValidPass = await user?.isPasswordValid(data.current_password);
    if(!isValidPass) return res.status(400).json({message: "wrong password!"});
    
    user!.email = data.email;
    const updatedUser = await user?.save();
    if(!updatedUser) return res.status(400).json({message: "change email failed!"});
    return res.status(200).json({message: "changing email success", email: updatedUser.email});


  } catch (error) {
   return res.status(500).json({message: "Internal server error from update email section."});
  }
}
const updatePhone = async (req: IGetUserInterfaceRequst, res: Response) => {
  //get user,
  // new phone and current password
  // current password validity
  // save phone

  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(404).json(errors);
  const JWTUser = req.user;
  const data = matchedData(req) as {phone: string, current_password: string};
  try {
    const user = await UserModel.findById(JWTUser?._id);
    const isValidPass = await user?.isPasswordValid(data.current_password);
    if(!isValidPass) return res.status(400).json({message: "wrong password!"});
    
    user!.phone = data.phone;
    const updatedUser = await user?.save();
    if(!updatedUser) return res.status(400).json({message: "change phone failed!"});
    return res.status(200).json({message: "changing phone number success", phone: updatedUser.phone});


  } catch (error) {
   return res.status(500).json({message: "Internal server error from update phone section."});
  }
}

const updateName = async (req: IGetUserInterfaceRequst, res: Response) => {
  //get user,
  // new name and current password
  // current password validity
  // save name

  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(404).json(errors);
  const JWTUser = req.user;
  const data = matchedData(req) as {name: string, current_password: string};
  try {
    const user = await UserModel.findById(JWTUser?._id);

    const isValidPass = await user?.isPasswordValid(data.current_password);
    if(!isValidPass) return res.status(400).json({message: "wrong password!"});
    
    user!.name = data.name;
    const updatedUser = await user?.save();
    
    if(!updatedUser) return res.status(400).json({message: "change name failed!"});

    return res.status(200).json({message: "changing name success", name: updatedUser.name});

  } catch (error) {
   return res.status(500).json({message: "Internal server error from update name section."});
  }
}

const updateRole = async (req: IGetUserInterfaceRequst, res: Response) => {
  //get user,
  // new role and current password
  // current password validity
  // save role

  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(404).json(errors);
  const JWTUser = req.user;
  const data = matchedData(req) as {role: string, current_password: string};
  try {
    const user = await UserModel.findById(JWTUser?._id);
    const isValidPass = await user?.isPasswordValid(data.current_password);
    if(!isValidPass) return res.status(400).json({message: "wrong password!"});
    
    user!.role = data.role;
    const updatedUser = await user?.save();
    if(!updatedUser) return res.status(400).json({message: "change role failed!"});
    return res.status(200).json({message: "changing role success", role: updatedUser.role});


  } catch (error) {
   return res.status(500).json({message: "Internal server error from update role section."});
  }
}


export { updateAvatar, updatePassword, updateEmail, updatePhone, updateName, updateRole };
