import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Attendance from "../models/Attendance";
import SwapRequest from "../models/SwapRequest";
import MondayRotation from "../models/MondayRotation";
import { JwtPayload } from "../types/JwtPayload";

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your_secret_key_here";

/* ================================
   VERIFY ADMIN
================================ */

const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization header missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as JwtPayload;

    if (decoded.role !== "Admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    (req as any).userId = decoded.id;
    (req as any).userRole = decoded.role;

    next();
  } catch {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};

/* ================================
   GET ALL FACULTY
================================ */

router.get(
  "/faculty",
  verifyAdmin,
  async (_req: Request, res: Response) => {
    try {
      const faculty = await User.find({
        role: "Faculty",
      })
        .select("_id name email college")
        .sort({ name: 1 })
        .lean();

      res.json(faculty);
    } catch (err) {
      console.error("Error fetching faculty:", err);

      res.status(500).json({
        message: "Error fetching faculty",
      });
    }
  }
);

/* ================================
   FACULTY ATTENDANCE
================================ */

router.get(
  "/attendance",
  verifyAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        facultyId,
        college,
        status,
        from,
        to,
      } = req.query;

      const filter: any = {};

      if (facultyId) {
        filter.facultyId = facultyId;
      }

      if (status) {
        filter.status = status;
      }

      if (from || to) {
        filter.date = {};

        if (from) {
          filter.date.$gte = new Date(
            `${from}T00:00:00`
          );
        }

        if (to) {
          filter.date.$lte = new Date(
            `${to}T23:59:59`
          );
        }
      }

      let attendance = await Attendance.find(filter)
        .populate(
          "facultyId",
          "name email college"
        )
        .sort({
          date: -1,
          periodNumber: 1,
        })
        .lean();

      /* College filter */
      if (college) {
        attendance = attendance.filter(
          (record: any) =>
            record.facultyId?.college === college
        );
      }

      res.json(attendance);
    } catch (err) {
      console.error(
        "Error fetching attendance:",
        err
      );

      res.status(500).json({
        message: "Error fetching attendance",
      });
    }
  }
);

/* ================================
   ALL SWAP REQUESTS
================================ */

router.get(
  "/swaps",
  verifyAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        status,
        facultyId,
        from,
        to,
      } = req.query;

      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (facultyId) {
        filter.$or = [
          { requesterId: facultyId },
          { responderId: facultyId },
        ];
      }

      if (from || to) {
        filter.createdAt = {};

        if (from) {
          filter.createdAt.$gte = new Date(
            `${from}T00:00:00`
          );
        }

        if (to) {
          filter.createdAt.$lte = new Date(
            `${to}T23:59:59`
          );
        }
      }

      const requests = await SwapRequest.find(
        filter
      )
        .sort({ createdAt: -1 })
        .lean();

      res.json(requests);
    } catch (err) {
      console.error(
        "Error fetching swap activities:",
        err
      );

      res.status(500).json({
        message: "Error fetching swap activities",
      });
    }
  }
);

/* ================================
   SET MONDAY ORDER
================================ */

router.put(
  "/monday-rotation",
  verifyAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        weekStart,
        mondayOrder,
      } = req.body;

      if (!weekStart || !mondayOrder) {
        return res.status(400).json({
          message:
            "weekStart and mondayOrder are required",
        });
      }

      const validOrders = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      if (!validOrders.includes(mondayOrder)) {
        return res.status(400).json({
          message: "Invalid Monday order",
        });
      }

      const rotation =
        await MondayRotation.findOneAndUpdate(
          { weekStart: new Date(weekStart) },
          {
            weekStart: new Date(weekStart),
            mondayOrder,
            setBy: (req as any).userId,
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      res.json({
        message: "Monday order saved successfully",
        rotation,
      });
    } catch (err) {
      console.error(
        "Error saving Monday order:",
        err
      );

      res.status(500).json({
        message: "Error saving Monday order",
      });
    }
  }
);

/* ================================
   GET MONDAY ORDER
================================ */

router.get(
  "/monday-rotation",
  verifyAdmin,
  async (req: Request, res: Response) => {
    try {
      const { weekStart } = req.query;

      if (!weekStart) {
        return res.status(400).json({
          message: "weekStart is required",
        });
      }

      const rotation =
        await MondayRotation.findOne({
          weekStart: new Date(
            weekStart as string
          ),
        }).lean();

      res.json(rotation);
    } catch (err) {
      console.error(
        "Error fetching Monday order:",
        err
      );

      res.status(500).json({
        message: "Error fetching Monday order",
      });
    }
  }
);

export default router;