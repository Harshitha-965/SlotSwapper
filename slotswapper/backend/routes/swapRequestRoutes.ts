import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import SwapRequest from "../models/SwapRequest";
import Event from "../models/Event";
import { JwtPayload } from "../types/JwtPayload";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

/** 🔒 Middleware for verifying token */
const verifyToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).userId = decoded.id;
    (req as any).userName = decoded.name;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/** ✅ Create new swap request */
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { targetEventId, offerEventId } = req.body;
    const requesterId = (req as any).userId;
    const requesterName = (req as any).userName;

    const requestedEvent = await Event.findById(targetEventId);
    const offeredEvent = await Event.findById(offerEventId);

    if (!requestedEvent || !offeredEvent)
      return res.status(404).json({ message: "Events not found" });

    const responderId = requestedEvent.ownerId;
    const responderName = requestedEvent.ownerName;

    const newRequest = new SwapRequest({
      requesterId,
      requesterName,
      responderId,
      responderName,
      offeredSlot: {
        eventId: offerEventId,
        title: offeredEvent.title,
        start: offeredEvent.start,
        end: offeredEvent.end,
      },
      requestedSlot: {
        eventId: targetEventId,
        title: requestedEvent.title,
        start: requestedEvent.start,
        end: requestedEvent.end,
      },
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error creating swap request:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

/** ✅ Get incoming requests for current user */
router.get("/incoming", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const requests = await SwapRequest.find({ responderId: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(requests);
  } catch (err) {
    console.error("Error fetching incoming requests:", err);
    res.status(500).json({ message: "Error fetching incoming requests" });
  }
});

/** ✅ Get outgoing requests by current user */
router.get("/outgoing", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const requests = await SwapRequest.find({ requesterId: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(requests);
  } catch (err) {
    console.error("Error fetching outgoing requests:", err);
    res.status(500).json({ message: "Error fetching outgoing requests" });
  }
});

/** ✅ Accept request and perform event swap */
router.patch("/:id/accept", verifyToken, async (req: Request, res: Response) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (String(request.responderId) !== String((req as any).userId))
      return res.status(403).json({ message: "Not authorized" });

    // ✅ Fetch both involved events
    const offeredEvent = await Event.findById(request.offeredSlot.eventId);
    const requestedEvent = await Event.findById(request.requestedSlot.eventId);

    if (!offeredEvent || !requestedEvent) {
      return res.status(404).json({ message: "One or both events not found" });
    }

    // ✅ Perform swap (exchange owners)
    const tempOwnerId = offeredEvent.ownerId;
    const tempOwnerName = offeredEvent.ownerName;

    offeredEvent.ownerId = requestedEvent.ownerId;
    offeredEvent.ownerName = requestedEvent.ownerName;
    requestedEvent.ownerId = tempOwnerId;
    requestedEvent.ownerName = tempOwnerName;

    // ✅ Both events become Busy after swap
    offeredEvent.status = "Busy";
    requestedEvent.status = "Busy";

    await offeredEvent.save();
    await requestedEvent.save();

    // ✅ Update request status
    request.status = "accepted";
    await request.save();

    console.log("✅ Swap completed successfully between:", {
      offeredEvent: offeredEvent.title,
      requestedEvent: requestedEvent.title,
    });

    res.json({
      message: "Swap completed successfully",
      request,
      offeredEvent,
      requestedEvent,
    });
  } catch (err) {
    console.error("Error accepting and swapping:", err);
    res.status(500).json({ message: "Error performing swap", error: err });
  }
});


/** ✅ Reject request */
router.patch("/:id/reject", verifyToken, async (req: Request, res: Response) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (String(request.responderId) !== String((req as any).userId))
      return res.status(403).json({ message: "Not authorized" });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected", request });
  } catch (err) {
    console.error("Error rejecting request:", err);
    res.status(500).json({ message: "Error rejecting request" });
  }
});
/** ✅ Delete a request (either requester or responder can delete it) */
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    const userId = (req as any).userId;
    if (
      String(request.requesterId) !== String(userId) &&
      String(request.responderId) !== String(userId)
    ) {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }

    await request.deleteOne();
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("Error deleting request:", err);
    res.status(500).json({ message: "Error deleting request", error: err });
  }
});


export default router;
