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

router.route('/update/title/:id').patch( verifyJWT ,verifyRole("admin") , updatePackageTitle);
router.route('/update/description/:id').patch( verifyJWT ,verifyRole("admin") , updatePackageDescription);
router.route('/update/status/:id').patch( verifyJWT ,verifyRole("admin") , updatePackageStatus);
router.route('/update/icon/:id').patch( upload.single('icon') ,verifyJWT , verifyRole("admin") , updatePackageIcon);
router.route('/update/category/:id').patch( verifyJWT , verifyRole("admin") , updatePackageCategory);
router.route('/update/price/:id').patch( verifyJWT , verifyRole("admin") , updatePackagePrice);
router.route('/update/deliverytime/:id').patch( verifyJWT , verifyRole("admin") , updatePackageDeliveryTime);
router.route('/update/revisiontime/:id').patch( verifyJWT , verifyRole("admin") , updatePackageRevisionTime);
router.route('/update/features/:id').patch([check('features','features must be a array of string!').notEmpty().isArray()], verifyJWT , verifyRole("admin") , updatePackageFeatures);


export default router;