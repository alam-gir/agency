import { Router } from "express";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { upload } from "../middlewares/multer.middleware";
import { updateAvatar, updateEmail, updatePassword } from "../controllers/user.controller.ts";
import { emailDataValidation, passwordDataValidation } from "../utils/expressValidation";

const router = Router();

// secured routes
router.route("/update/avatar").patch(verifyJWT,upload.single('avatar'), updateAvatar);
router.route("/update/password").patch(verifyJWT,passwordDataValidation, updatePassword);
router.route("/update/email").patch(verifyJWT,emailDataValidation, updateEmail);

export default router;