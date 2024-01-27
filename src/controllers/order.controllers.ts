import { Request, Response } from "express";

const placeOrder = async( req: Request, res: Response) => {

    res.status(200).json({message: "Order placed successfully"})
}


export {
    placeOrder,
}