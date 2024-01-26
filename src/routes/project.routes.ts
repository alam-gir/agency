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
  .route("/:id/update/title")
  .patch(verifyJWT, verifyRole("admin"), updateProjectTitle);
router
  .route("/:id/update/description")
  .patch(verifyJWT, verifyRole("admin"), updateProjectDescription);
router
  .route("/:id/update/status")
  .patch(verifyJWT, verifyRole("admin"), updateProjectStatus);
router
  .route("/:id/update/category")
  .patch(verifyJWT, verifyRole("admin"), updateProjectCategory);

router
  .route("/:id/upload/image")
  .post(
    upload.single("image"),
    verifyJWT,
    verifyRole("admin"),
    uploadProjectImage
  );
router
  .route("/:id/delete/image")
  .delete(verifyJWT, verifyRole("admin"), deleteProjectImage);

router
  .route("/:id/upload/file")
  .post(
    upload.single("file"),
    verifyJWT,
    verifyRole("admin"),
    uploadProjectFile
  );
router
  .route("/:id/delete/file")
  .delete(verifyJWT, verifyRole("admin"), deleteProjectFile);

router
  .route("/:id/delete")
  .delete(verifyJWT, verifyRole("admin"), deleteProject);

export default router;
