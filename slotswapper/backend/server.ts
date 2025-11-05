import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Routes
app.use("/api/auth", authRoutes);

// Optional test route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

const PORT: number = Number(process.env.PORT) || 5000;

// MongoDB connection
const mongoURI: string = process.env.MONGO_URI || "";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: Error) => console.error("MongoDB connection error:", err));
