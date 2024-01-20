import mongoose from "mongoose"

const DB_URI = process.env.MONDODB_URI; 

export const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI as string)
        console.log("Database connected at - ", connectionInstance.connection.host)
    } catch (error) {
        console.log("database connection failed", error)
        throw new Error("database connection failed");

    }
}