import { Router } from "express";
import { createCategory, getCategory, getSingleCategory, updateCategoryIcon, updateCategoryTitle } from "../controllers/category.controllers.ts";
import { verifyJWT } from "../middlewares/jwtVerify.middleware.ts";
import { verifyRole } from "../middlewares/verifyRole.middleware.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { categoryDataValidation } from "../utils/expressValidation.ts";

const router = Router();

// open routes
router.route("/").get(getCategory);
router.route("/:id").get(getSingleCategory);

//secured routes
router.route("/create").post(upload.single("icon") , verifyJWT, verifyRole("admin"),categoryDataValidation ,createCategory);
router.route("/:id/update/title").patch(verifyJWT, verifyRole("admin"),categoryDataValidation ,updateCategoryTitle);
router.route("/:id/update/icon").patch(upload.single("icon") ,verifyJWT, verifyRole("admin"),categoryDataValidation ,updateCategoryIcon);
router.route("/:id/delete");

export default router;