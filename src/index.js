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
const deployedClientUrl = "https://realtime-chatapp-ashen-nine.vercel.app";

// Allowed origins for CORS
const allowedOrigins = [
    "http://localhost:5173",
    "https://realtime-chatapp-ashen-nine.vercel.app"
];

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
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

// API Configuration endpoint - returns the base URL for API calls
// Frontend can fetch this on startup to get the correct API URL
app.get("/api/config", (req, res) => {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    res.status(200).json({
        apiUrl: baseUrl,
        env: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Validate required environment variables
const requiredEnvVars = ['MONGODBURI', 'JWT_SECRET', 'JWT_EXPIRES_IN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Connect to database first, then start server
connectDB().then(() => {
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    process.exit();
});
