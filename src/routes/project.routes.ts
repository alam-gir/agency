import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { verifyRole } from "../middlewares/verifyRole.middleware";
import { createProject } from "../controllers/project.controllers";
import { projectCreateDataValidation } from "../utils/expressValidation";

const router = Router();

router.route("/create").post(upload.fields([{name: "files", maxCount: 5}, {name: "images", maxCount: 5}]), projectCreateDataValidation, verifyJWT, verifyRole("admin"), createProject);

export default router;