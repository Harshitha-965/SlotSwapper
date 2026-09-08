import { Router, Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

/** Token validation route */
router.get("/validate", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      valid: false,
      message: "Missing token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.json({
      valid: true,
      user: decoded,
    });
  } catch (err) {
    return res.status(401).json({
      valid: false,
      message: "Invalid or expired token",
    });
  }
});

/** Signup */
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, college, role } = req.body;

    if (!name || !email || !password || !college || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      college,
      role,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        college: newUser.college,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        college: newUser.college,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/** Login */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        college: user.college,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;