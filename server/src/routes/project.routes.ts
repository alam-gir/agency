import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { verifyRole } from "../middlewares/verifyRole.middleware";
import * as projectControll from "../controllers/project.controllers";
import { projectCreateDataValidation } from "../utils/expressValidation";

const router = Router();

// open routes

router.route("/").get(projectControll.getAllProjects);
router.route("/:id").get(projectControll.getSingleProject);

// secure all routes with JWT, and allow only admin to access

router
  .route("/create")
  .post(
    projectCreateDataValidation,
    verifyJWT,
    verifyRole("admin"),
    projectControll.createProject
  );

router
  .route("/:id/update/title")
  .patch(verifyJWT, verifyRole("admin"), projectControll.updateProjectTitle);
router
  .route("/:id/update/description")
  .patch(verifyJWT, verifyRole("admin"), projectControll.updateProjectDescription);
router
  .route("/:id/update/status")
  .patch(verifyJWT, verifyRole("admin"), projectControll.updateProjectStatus);
router
  .route("/:id/update/category")
  .patch(verifyJWT, verifyRole("admin"), projectControll.updateProjectCategory);

router
  .route("/:id/upload/image")
  .post(
    upload.single("image"),
    verifyJWT,
    verifyRole("admin"),
    projectControll.uploadProjectImage
  );
router
  .route("/:id/delete/image")
  .delete(verifyJWT, verifyRole("admin"), projectControll.deleteProjectImage);

router
  .route("/:id/upload/file")
  .post(
    upload.single("file"),
    verifyJWT,
    verifyRole("admin"),
    projectControll.uploadProjectFile
  );
router
  .route("/:id/delete/file")
  .delete(verifyJWT, verifyRole("admin"), projectControll.deleteProjectFile);

router
  .route("/:id/delete")
  .delete(verifyJWT, verifyRole("admin"), projectControll.deleteProject);

export default router;
