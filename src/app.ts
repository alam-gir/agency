import express, {Application} from "express"
import authRoutes from "./routes/auth.routes.ts"
import userRoutes from "./routes/user.routes.ts"
import categoryRoutes from "./routes/category.routes.ts"
import projectRoutes from "./routes/project.routes.ts";
import packageRoutes from "./routes/package.routes.ts";
import serviceRoutes from "./routes/service.routes.ts"
import cookieParser from "cookie-parser";

const app:Application =  express();


// use packages
app.use(express.json({limit: "3mb"}));
app.use(cookieParser())

//use routes
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/category",categoryRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/package", packageRoutes)
app.use("/api/v1/service", serviceRoutes)

export default app;