import express, {Application} from "express"
import authRoutes from "./routes/auth.routes.ts"
import userRoutes from "./routes/user.routes.ts"
import categoryRoutes from "./routes/category.routes.ts"
import projectRoutes from "./routes/project.routes.ts";
import packageRoutes from "./routes/package.routes.ts";
import serviceRoutes from "./routes/service.routes.ts"
import orderRoutes from "./routes/order.routes.ts"
import cookieParser from "cookie-parser";
import cors from 'cors'
import path from "path";
import next from "next";

const app:Application =  express();
app.use(cors());
export const nextApp = next({ dev: true });
const handle = nextApp.getRequestHandler();

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
app.use("/api/v1/order", orderRoutes)

export default app;