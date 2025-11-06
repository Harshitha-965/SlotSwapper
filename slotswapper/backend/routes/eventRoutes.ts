import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Event from "../models/Event";
import { JwtPayload } from "../types/JwtPayload"; // optional, if you have this type file

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

/** ✅ Middleware to verify JWT token */
const verifyToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  try {
    console.log("JWT_SECRET used for verify:", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).userId = decoded.id;
    (req as any).userName = decoded.name;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/** ✅ Create a new Event */
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, start, end, status } = req.body;

    const newEvent = new Event({
      title,
      start,
      end,
      status,
      ownerId: (req as any).userId,
      ownerName: (req as any).userName,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

/** ✅ Get all events created by the logged-in user */
router.get("/mine", verifyToken, async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ ownerId: (req as any).userId }).sort({
      start: 1,
    });
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).json({ message: "Error fetching user events", error: err });
  }
});

/** ✅ Get all Swappable events (Marketplace – visible to everyone except current user) */
router.get("/marketplace", async (req: Request, res: Response) => {
  try {
    let excludeOwnerId: string | null = null;

    // If token exists, decode to exclude current user's events
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        excludeOwnerId = decoded.id;
      } catch (e) {
        console.warn("Invalid token while fetching marketplace events, ignoring.");
      }
    }

    const filter: any = { status: "Swappable" };
    if (excludeOwnerId) filter.ownerId = { $ne: excludeOwnerId };

    const swappableEvents = await Event.find(filter)
      .populate("ownerId", "name email")
      .sort({ start: 1 });

    res.status(200).json(swappableEvents);
  } catch (err) {
    console.error("Error fetching marketplace events:", err);
    res
      .status(500)
      .json({ message: "Error fetching marketplace events", error: err });
  }
});

/** ✅ Toggle event status (Busy ↔ Swappable) */
router.patch("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // Only owner can update
    if (String(event.ownerId) !== String((req as any).userId)) {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    event.status = status;
    await event.save();

    res.status(200).json(event);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Error updating event", error: err });
  }
});

/** ✅ Delete an event (only by owner) */
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // Only owner can delete
    if (String(event.ownerId) !== String((req as any).userId)) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Error deleting event", error: err });
  }
});

export default router;
