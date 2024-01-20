import { Router } from "express";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { upload } from "../middlewares/multer.middleware";
import { updateAvatar, updatePassword } from "../controllers/user.controller.ts";
import { passwordDataValidation } from "../utils/expressValidation";

const router = Router();

// secured routes
router.route("/update/avatar").patch(verifyJWT,upload.single('avatar'), updateAvatar);
router.route("/update/password").patch(verifyJWT,passwordDataValidation, updatePassword);

export default router;