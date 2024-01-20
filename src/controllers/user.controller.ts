import { Response } from "express";
import { IGetUserInterfaceRequst } from "../../@types/custom";
import { IUserWithAvatar, UserModel } from "../models/user.model";
import { delete_cloudinary, upload_cloudinary } from "../utils/cloudinary";
import { ImageModel } from "../models/image.model";

const updateAvatar = async (req: IGetUserInterfaceRequst, res: Response) => {
    // grab new avatar
    const avatarPath = req.file?.path;
    if(!avatarPath) return res.status(404).json({message: "Avatar not found!"});
  
    const user = req.user; 
  try {
      const userData = await UserModel.findById(user?._id)
        .populate("avatar") as IUserWithAvatar
    
      // update new avatar in upload_cloudinary
      const uploadedAvatar = upload_cloudinary(avatarPath as string,process.env.AVATAR_FOLDER as string);
      const deletePrev = delete_cloudinary(userData.avatar.public_id);
      const [avatarResponse, deleteResponse] = await Promise.all([uploadedAvatar, deletePrev]);
      
      const image = await ImageModel.findOneAndUpdate({_id: userData.avatar._id},{
        url: avatarResponse?.secure_url!,
        public_id: avatarResponse?.public_id!
      },{new: true});
      if(!image)return res.status(400).json({message: "avatar update failed"});
    
      return res.status(200).json({message: "avatar update successful!", avatar: avatarResponse?.url});
      //success - delete previous avatar from cloudinary
  } catch (error) {
    return res.status(500).json({message: "Internal server error to update avatar!"})
  }
  };



  export {
    updateAvatar,
  }