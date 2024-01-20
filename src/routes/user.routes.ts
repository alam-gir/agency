import { Router } from "express";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { upload } from "../middlewares/multer.middleware";
import { updateAvatar } from "../controllers/user.controller";

const router = Router();

// secured routes
router.route("/update/avatar").patch(verifyJWT,upload.single('avatar'), updateAvatar);

export default router;