import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { verifyRole } from "../middlewares/verifyRole.middleware";
import {
  createProject,
  deleteProject,
  deleteProjectFile,
  deleteProjectImage,
  getAllProjects,
  getSingleProject,
  updateProjectCategory,
  updateProjectDescription,
  updateProjectStatus,
  updateProjectTitle,
  uploadProjectFile,
  uploadProjectImage,
} from "../controllers/project.controllers";
import { projectCreateDataValidation } from "../utils/expressValidation";
import { check } from "express-validator";

const router = Router();

// open routes

router.route("/").get(getAllProjects);
router.route("/:id").get(getSingleProject);

// secure all routes with JWT, and allow only admin to access

router
  .route("/create")
  .post(
    projectCreateDataValidation,
    verifyJWT,
    verifyRole("admin"),
    createProject
  );

router
  .route("/update/title/:id")
  .patch(verifyJWT, verifyRole("admin"), updateProjectTitle);
router
  .route("/update/description/:id")
  .patch(verifyJWT, verifyRole("admin"), updateProjectDescription);
router
  .route("/update/status/:id")
  .patch(verifyJWT, verifyRole("admin"), updateProjectStatus);
router
  .route("/update/category/:id")
  .patch(verifyJWT, verifyRole("admin"), updateProjectCategory);

router
  .route("/upload/image/:id")
  .post(
    upload.single("image"),
    verifyJWT,
    verifyRole("admin"),
    uploadProjectImage
  );
router
  .route("/delete/image/:id")
  .delete(verifyJWT, verifyRole("admin"), deleteProjectImage);

router
  .route("/upload/file/:id")
  .post(
    upload.single("file"),
    verifyJWT,
    verifyRole("admin"),
    uploadProjectFile
  );
router
  .route("/delete/file/:id")
  .delete(verifyJWT, verifyRole("admin"), deleteProjectFile);

router
  .route("/delete/:id")
  .delete(verifyJWT, verifyRole("admin"), deleteProject);

export default router;
