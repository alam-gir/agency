import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { verifyRole } from "../middlewares/verifyRole.middleware";
import { createProject, deleteProjectFile, deleteProjectImage, uploadProjectFile, uploadProjectImage } from "../controllers/project.controllers";
import { projectCreateDataValidation } from "../utils/expressValidation";
import { check } from "express-validator";

const router = Router();

router.route("/create").post( projectCreateDataValidation, verifyJWT, verifyRole("admin"), createProject);
router.route("/upload/image/:id").post(upload.single('image'), verifyJWT, verifyRole("admin"), uploadProjectImage)
router.route("/delete/image/:id").post([check("imageId","image id not found!").notEmpty()], verifyJWT, verifyRole("admin"), deleteProjectImage)
router.route("/upload/file/:id").post(upload.single('file'), verifyJWT, verifyRole("admin"), uploadProjectFile)
router.route("/delete/file/:id").post([check("fileId","file id not found!").notEmpty()], verifyJWT, verifyRole("admin"), deleteProjectFile)

export default router;