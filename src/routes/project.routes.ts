import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { verifyRole } from "../middlewares/verifyRole.middleware";
import { createProject, uploadProjectImage } from "../controllers/project.controllers";
import { projectCreateDataValidation } from "../utils/expressValidation";

const router = Router();

router.route("/create").post( projectCreateDataValidation, verifyJWT, verifyRole("admin"), createProject);
router.route("/upload/images/:id").post(upload.single('image'), verifyJWT, verifyRole("admin"), uploadProjectImage)

export default router;