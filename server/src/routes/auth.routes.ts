import { Router } from "express";
import * as authControll from "../controllers/auth.controllers.ts";
import { loginUserDataValidation, registerUserDataValidation } from "../utils/expressValidation.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { verifyJWT } from "../middlewares/jwtVerify.middleware.ts";

const router = Router();

router.route("/register").post(upload.single('avatar'),registerUserDataValidation,authControll.registerUser);
router.route("/login").post(loginUserDataValidation, authControll.loginUser);
router.route("/reset-token").post(authControll.reGenerateRefreshToken);

//secured
router.route("/logout").post(verifyJWT,authControll.logOutUser);

export default router;