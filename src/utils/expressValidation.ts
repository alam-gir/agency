import { check } from "express-validator";

const registerUserDataValidation = [
    check("name","Name must required!")
    .notEmpty()
    .isLength({min: 3}).withMessage("name must have minimum 3 characters!")
    .isLength({max: 20}).withMessage("name maximum have 20 characters!"),

    check("email", "Email must required!").notEmpty().isEmail().withMessage("Valid email needed!"),

    check("password","Password must required!")
    .notEmpty()
    .isLength({min: 5}).withMessage("password must have minimum 5 characters!")
    .isLength({max: 20}).withMessage("password maximum have 20 characters!"),

    check("phone", "phone number must required!").notEmpty(),

]

const loginUserDataValidation = [
    check("email", "Email must required!").notEmpty().isEmail().withMessage("Valid email needed!"),

    check("password","Password must required!")
    .notEmpty()
    .isLength({min: 5}).withMessage("password must have minimum 5 characters!")
    .isLength({max: 20}).withMessage("password maximum have 20 characters!"),

]

const passwordDataValidation = [
    check("current_password","current password must required!")
    .notEmpty()
    .isLength({min: 5}).withMessage("password must have minimum 5 characters!")
    .isLength({max: 20}).withMessage("password maximum have 20 characters!"),

    check("confirm_password","confirm password must required!")
    .notEmpty()
    .isLength({min: 5}).withMessage("password must have minimum 5 characters!")
    .isLength({max: 20}).withMessage("password maximum have 20 characters!"),

]

const emailDataValidation = [
    check("email", "Email must required!").notEmpty().isEmail().withMessage("Valid email needed!"),

    check("current_password","current password must required!")
    .notEmpty()
    .isLength({min: 5}).withMessage("password must have minimum 5 characters!")
    .isLength({max: 20}).withMessage("password maximum have 20 characters!"),
]

export {
    registerUserDataValidation,
    loginUserDataValidation,
    passwordDataValidation,
    emailDataValidation
}