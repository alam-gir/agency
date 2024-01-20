import express, {Application} from "express"
import authRoutes from "./routes/auth.routes.ts"
import userRoutes from "./routes/user.routes.ts"
import cookieParser from "cookie-parser";

const app:Application =  express();


// use packages
app.use(express.json());
app.use(cookieParser())

//use routes
app.use("/api/v1/auth",authRoutes);
app.use("/api/user", userRoutes)


export default app;