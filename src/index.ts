import app from "./app";
import dotenv from "dotenv"
import { connectDB } from "./utils/db";

dotenv.config({});

const port = process.env.PORT;
connectDB().then(db => {
    const server = app.listen(port, () => {console.log("Server run at port -> ", port)});
    server.timeout = 60000 * 5;
    
}).catch(error => console.log(error.message))

