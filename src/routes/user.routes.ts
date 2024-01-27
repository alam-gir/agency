import { Router } from "express";
import { verifyJWT } from "../middlewares/jwtVerify.middleware.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import * as userControll from "../controllers/user.controllers.ts";
import { emailDataValidation, nameDataValidation, passwordDataValidation, phoneDataValidation, roleDataValidation } from "../utils/expressValidation.ts";

const router = Router();

// secured routes
router.route("/update/avatar").patch(verifyJWT,upload.single('avatar'), userControll.updateAvatar);
router.route("/update/password").patch(verifyJWT,passwordDataValidation, userControll.updatePassword);
router.route("/update/email").patch(verifyJWT,emailDataValidation, userControll.updateEmail);
router.route("/update/phone").patch(verifyJWT,phoneDataValidation, userControll.updatePhone);
router.route("/update/name").patch(verifyJWT,nameDataValidation, userControll.updateName);
router.route("/update/role").patch(verifyJWT,roleDataValidation, userControll.updateRole);

export default router;