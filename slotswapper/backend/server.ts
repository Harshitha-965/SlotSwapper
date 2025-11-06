import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/eventRoutes";
import swapRequestRoutes from "./routes/swapRequestRoutes"; // ✅ add this line



// ✅ Load environment variables
//dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/requests", swapRequestRoutes);

// ✅ Health check route
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Server is running and connected to MongoDB!");
});

// ✅ Port and Mongo URI setup
const PORT: number = Number(process.env.PORT) || 5000;
const mongoURI: string = process.env.MONGO_URI || "";

// ✅ Validate environment configuration
if (!mongoURI) {
  console.error("❌ MONGO_URI not found in environment variables.");
  process.exit(1);
}

// ✅ Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    app.listen(PORT, () =>
      console.log(`🌐 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err: Error) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Global error handling middleware (optional safety net)
app.use((err: any, _req: Request, res: Response, _next: Function) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
