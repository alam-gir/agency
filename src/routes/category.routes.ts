import { Router } from "express";
import * as categoryControll from "../controllers/category.controllers.ts";
import { verifyJWT } from "../middlewares/jwtVerify.middleware.ts";
import { verifyRole } from "../middlewares/verifyRole.middleware.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { categoryDataValidation } from "../utils/expressValidation.ts";

const router = Router();

// open routes
router.route("/").get(categoryControll.getCategory);
router.route("/:id").get(categoryControll.getSingleCategory);

//secured routes
router.route("/create").post(upload.single("icon") , verifyJWT, verifyRole("admin"),categoryDataValidation ,categoryControll.createCategory);
router.route("/:id/update/title").patch(verifyJWT, verifyRole("admin"),categoryDataValidation ,categoryControll.updateCategoryTitle);
router.route("/:id/update/icon").patch(upload.single("icon") ,verifyJWT, verifyRole("admin"),categoryDataValidation ,categoryControll.updateCategoryIcon);
router.route("/:id/delete");

export default router;