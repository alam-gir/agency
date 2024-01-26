import Router from 'express';
import {createPackage, getAllPackage, getSinglePackage, updatePackageCategory, updatePackageDeliveryTime, updatePackageDescription, updatePackageFeatures, updatePackageIcon, updatePackagePrice, updatePackageRevisionTime, updatePackageStatus, updatePackageTitle} from '../controllers/package.controllers.ts'
import { packageCreateDataValidation } from '../utils/expressValidation.ts';
import { verifyJWT } from '../middlewares/jwtVerify.middleware.ts';
import { verifyRole } from '../middlewares/verifyRole.middleware.ts';
import { upload } from '../middlewares/multer.middleware.ts';
import { check } from 'express-validator';
const router = Router();

// open routes
router.route('/').get(getAllPackage);
router.route('/:id').get(getSinglePackage);

// protected routes
router.route('/create').post(upload.single('icon') ,packageCreateDataValidation ,verifyJWT ,verifyRole("admin") , createPackage);

router.route('/:id/update/title').patch( verifyJWT ,verifyRole("admin") , updatePackageTitle);
router.route('/:id/update/description').patch( verifyJWT ,verifyRole("admin") , updatePackageDescription);
router.route('/:id/update/status').patch( verifyJWT ,verifyRole("admin") , updatePackageStatus);
router.route('/:id/update/icon').patch( upload.single('icon') ,verifyJWT , verifyRole("admin") , updatePackageIcon);
router.route('/:id/update/category').patch( verifyJWT , verifyRole("admin") , updatePackageCategory);
router.route('/:id/update/price').patch( verifyJWT , verifyRole("admin") , updatePackagePrice);
router.route('/:id/update/deliverytime').patch( verifyJWT , verifyRole("admin") , updatePackageDeliveryTime);
router.route('/:id/update/revisiontime').patch( verifyJWT , verifyRole("admin") , updatePackageRevisionTime);
router.route('/:id/update/features').patch([check('features','features must be a array of string!').notEmpty().isArray()], verifyJWT , verifyRole("admin") , updatePackageFeatures);


export default router;