import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODBURI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds to select server
            connectTimeoutMS: 30000,        // 30 seconds to connect
            socketTimeoutMS: 45000,         // 45 seconds for socket timeout
        });
        console.log(`Mongodb connected: ${conn.connection.host}`);
    } catch (error) {
        console.log('Mongodb connection error', error);
    }
}
