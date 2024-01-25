import Router from 'express';
import {createPackage, updatePackageDescription, updatePackageIcon, updatePackageStatus, updatePackageTitle} from '../controllers/package.controllers.ts'
import { packageCreateDataValidation } from '../utils/expressValidation.ts';
import { verifyJWT } from '../middlewares/jwtVerify.middleware.ts';
import { verifyRole } from '../middlewares/verifyRole.middleware.ts';
import { upload } from '../middlewares/multer.middleware.ts';
const router = Router();

// open routes
router.route('/').get();

// protected routes
router.route('/create').post(upload.single('icon') ,packageCreateDataValidation ,verifyJWT ,verifyRole("admin") , createPackage);

router.route('/update/title/:id').patch( verifyJWT ,verifyRole("admin") , updatePackageTitle);
router.route('/update/description/:id').patch( verifyJWT ,verifyRole("admin") , updatePackageDescription);
router.route('/update/status/:id').patch( verifyJWT ,verifyRole("admin") , updatePackageStatus);
router.route('/update/icon/:id').patch( upload.single('icon') ,verifyJWT , verifyRole("admin") , updatePackageIcon);

export default router;