import app from "./app";
import dotenv from "dotenv"
import { connectDB } from "./utils/db";
import { error } from "console";

dotenv.config({});

const port = process.env.PORT;
connectDB().then(db => {
    app.listen(port, () => {console.log("Server run at port -> ", port)});
}).catch(error => console.log(error.message))