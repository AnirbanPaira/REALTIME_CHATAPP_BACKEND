import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import process from "process";
import { app,server } from "./lib/socket.js";

dotenv.config();

// Environment variables
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
    origin: clientUrl,
    credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint (for deployment monitoring)
app.get("/api/health", (req, res) => {
    res.status(200).json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Start server
server.listen(port, (error) => {
    if (!error) {
        console.log(`Server is running on port ${port}`);
        connectDB();
    } else {
        console.error("Error starting server:", error);
    }
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    process.exit();
});
