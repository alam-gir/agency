import { Router } from "express";
import { registerUser, loginUser, logOutUser, reGenerateRefreshToken } from "../controllers/auth.controllers.ts";
import { loginUserDataValidation, registerUserDataValidation } from "../utils/expressValidation.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { verifyJWT } from "../middlewares/jwtVerify.middleware.ts";

const router = Router();

router.route("/register").post(upload.single('avatar'),registerUserDataValidation,registerUser);
router.route("/login").post(loginUserDataValidation, loginUser);
router.route("/reset-token").post(reGenerateRefreshToken);

//secured
router.route("/logout").post(verifyJWT,logOutUser);

export default router;