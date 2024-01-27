import Router from 'express'
import * as orderControll from '../controllers/order.controllers';

const router = Router();

router.route("/place").post(orderControll.placeOrder);


export default router;