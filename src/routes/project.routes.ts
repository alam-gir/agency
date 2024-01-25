import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { verifyRole } from "../middlewares/verifyRole.middleware";
import { createProject, deleteProjectFile, deleteProjectImage, getAllProjects, getSingleProject, updateProjectDescription, updateProjectTitle, uploadProjectFile, uploadProjectImage } from "../controllers/project.controllers";
import { projectCreateDataValidation } from "../utils/expressValidation";
import { check } from "express-validator";

const router = Router();

// open routes

router.route("/").get(getAllProjects);
router.route("/:id").get(getSingleProject);

// secure all routes with JWT, and allow only admin to access

router.route("/create").post( projectCreateDataValidation, verifyJWT, verifyRole("admin"), createProject);

router.route("/update/title/:id").post([check("title","title is required!").notEmpty()], verifyJWT, verifyRole("admin"), updateProjectTitle);
router.route("/update/description/:id").post([check("title","title is required!").notEmpty()], verifyJWT, verifyRole("admin"), updateProjectDescription);

router.route("/upload/image/:id").post(upload.single('image'), verifyJWT, verifyRole("admin"), uploadProjectImage)
router.route("/delete/image/:id").post([check("imageId","image id not found!").notEmpty()], verifyJWT, verifyRole("admin"), deleteProjectImage)

router.route("/upload/file/:id").post(upload.single('file'), verifyJWT, verifyRole("admin"), uploadProjectFile)
router.route("/delete/file/:id").post([check("fileId","file id not found!").notEmpty()], verifyJWT, verifyRole("admin"), deleteProjectFile)



export default router;