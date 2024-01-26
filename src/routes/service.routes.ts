import { Router } from "express";
import { verifyJWT } from "../middlewares/jwtVerify.middleware";
import { verifyRole } from "../middlewares/verifyRole.middleware";
import {
  createService,
  updateService,
  updateServiceIcon,
} from "../controllers/service.controllers";
import { serviceCreateDataValidation, serviceUpdateDataValidation } from "../utils/expressValidation";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router
  .route("/create")
  .post(
    upload.single("icon"),
    serviceCreateDataValidation,
    verifyJWT,
    verifyRole("admin"),
    createService
  );

router
  .route("/:id/update")
  .patch(
    serviceUpdateDataValidation,
    verifyJWT,
    verifyRole("admin"),
    updateService
  );

router.route("/:id/update/icon").patch(upload.single('icon') ,verifyJWT, verifyRole("admin"), updateServiceIcon);


export default router;
