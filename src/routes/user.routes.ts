import { Router } from "express";
import { verifyJWT } from "../middlewares/jwtVerify.middleware.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { updateAvatar, updateEmail, updateName, updatePassword, updatePhone, updateRole } from "../controllers/user.controller.ts";
import { emailDataValidation, nameDataValidation, passwordDataValidation, phoneDataValidation, roleDataValidation } from "../utils/expressValidation.ts";

const router = Router();

// secured routes
router.route("/update/avatar").patch(verifyJWT,upload.single('avatar'), updateAvatar);
router.route("/update/password").patch(verifyJWT,passwordDataValidation, updatePassword);
router.route("/update/email").patch(verifyJWT,emailDataValidation, updateEmail);
router.route("/update/phone").patch(verifyJWT,phoneDataValidation, updatePhone);
router.route("/update/name").patch(verifyJWT,nameDataValidation, updateName);
router.route("/update/role").patch(verifyJWT,roleDataValidation, updateRole);

export default router;