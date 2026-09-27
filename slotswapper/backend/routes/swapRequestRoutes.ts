import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import SwapRequest from "../models/SwapRequest";
import Event from "../models/Event";
import WeeklySlotState from "../models/WeeklySlotState";
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

    if (!targetEventId || !offerEventId) {
      return res.status(400).json({ message: "targetEventId and offerEventId are required" });
    }

    if (String(targetEventId) === String(offerEventId)) {
      return res.status(400).json({ message: "A slot cannot request itself" });
    }

    const requestedEvent = await Event.findById(targetEventId);
    const offeredEvent = await Event.findById(offerEventId);

    if (!requestedEvent || !offeredEvent) {
      return res.status(404).json({ message: "Events not found" });
    }

    if (String(requestedEvent.ownerId) === String(requesterId)) {
      return res.status(400).json({ message: "You cannot request your own swappable slot" });
    }

    if (String(offeredEvent.ownerId) !== String(requesterId)) {
      return res.status(403).json({ message: "You can only offer your own slot" });
    }

    if (!["Swappable", "Emergency", "Free"].includes(requestedEvent.status)) {
      return res.status(400).json({ message: "Requested slot is not currently available for swapping" });
    }

    const duplicate = await SwapRequest.findOne({
      requesterId,
      "requestedSlot.eventId": targetEventId,
      "offeredSlot.eventId": offerEventId,
      status: "pending",
    });

    if (duplicate) {
      return res.status(409).json({ message: "A matching swap request is already pending" });
    }

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
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error creating swap request:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.get("/reports", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status, search } = req.query;

    const filter: any = {
      $or: [{ requesterId: userId }, { responderId: userId }],
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    const requests = await SwapRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const searchTerm = String(search || "").trim().toLowerCase();
    const filtered = searchTerm
      ? requests.filter((request: any) => {
          const requester = String(request.requesterName || "").toLowerCase();
          const responder = String(request.responderName || "").toLowerCase();
          const offered = String(request.offeredSlot?.title || "").toLowerCase();
          const requested = String(request.requestedSlot?.title || "").toLowerCase();
          return (
            requester.includes(searchTerm) ||
            responder.includes(searchTerm) ||
            offered.includes(searchTerm) ||
            requested.includes(searchTerm)
          );
        })
      : requests;

    const mapped = filtered.map((request: any) => ({
      ...request,
      action: String(request.requesterId) === String(userId) ? "sent" : "received",
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching swap reports:", err);
    res.status(500).json({ message: "Error fetching swap reports" });
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

    if (request.status !== "pending") {
      return res.status(409).json({ message: "This request has already been processed" });
    }

    if (String(request.responderId) !== String((req as any).userId))
      return res.status(403).json({ message: "Not authorized" });

    const resolveLiveEvent = async (slot: any, ownerId: string) => {
      const directMatch = await Event.findById(slot?.eventId);
      if (directMatch) return directMatch;

      if (!slot?.start || !slot?.end || !slot?.title) {
        return null;
      }

      return Event.findOne({
        ownerId,
        title: slot.title,
        start: slot.start,
        end: slot.end,
      });
    };

    const offeredEvent = await resolveLiveEvent(request.offeredSlot, String(request.requesterId));
    const requestedEvent = await resolveLiveEvent(request.requestedSlot, String(request.responderId));

    if (!offeredEvent || !requestedEvent) {
      return res.status(404).json({ message: "One or both events not found" });
    }

    request.offeredSlot.eventId = offeredEvent._id as typeof request.offeredSlot.eventId;
    request.requestedSlot.eventId = requestedEvent._id as typeof request.requestedSlot.eventId;

    if (
      String(offeredEvent.ownerId) !== String(request.requesterId) ||
      String(requestedEvent.ownerId) !== String(request.responderId)
    ) {
      return res.status(409).json({ message: "This swap request is no longer valid" });
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

    const currentWeekStart = new Date();
    currentWeekStart.setHours(0, 0, 0, 0);
    const dayOffset = currentWeekStart.getDay() === 0 ? -6 : 1 - currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() + dayOffset);

    const syncWeeklyState = async (
      facultyId: string,
      day: string,
      periodNumber: number,
      override?: {
        subject?: string;
        className?: string;
        room?: string;
      }
    ) => {
      let state = await WeeklySlotState.findOne({ facultyId, weekStart: currentWeekStart });

      if (!state) {
        state = new WeeklySlotState({ facultyId, weekStart: currentWeekStart, slots: [] });
      }

      let slot = state.slots.find((entry) => entry.day === day && entry.periodNumber === periodNumber);

      if (!slot) {
        slot = {
          day: day as any,
          periodNumber,
          status: "Busy",
          subject: "",
          className: "",
          room: "",
        };
        state.slots.push(slot as any);
      }

      slot.status = "Busy";
      if (override) {
        slot.subject = override.subject ?? "";
        slot.className = override.className ?? "";
        slot.room = override.room ?? "";
      }

      await state.save();
    };

    await syncWeeklyState(String(request.requesterId), offeredEvent.day || "Monday", offeredEvent.periodNumber || 1, {
      subject: requestedEvent.subject || "",
      className: requestedEvent.className || "",
      room: requestedEvent.room || "",
    });

    await syncWeeklyState(String(request.responderId), requestedEvent.day || "Monday", requestedEvent.periodNumber || 1, {
      subject: offeredEvent.subject || "",
      className: offeredEvent.className || "",
      room: offeredEvent.room || "",
    });

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
