import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISwapRequest extends Document {
  requesterId: mongoose.Types.ObjectId;  // who requested the swap
  requesterName: string;
  responderId: mongoose.Types.ObjectId;  // whose event was requested
  responderName: string;
  offeredSlot: {
    eventId: mongoose.Types.ObjectId;
    title: string;
    start: string;
    end: string;
  };
  requestedSlot: {
    eventId: mongoose.Types.ObjectId;
    title: string;
    start: string;
    end: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

const SwapRequestSchema: Schema<ISwapRequest> = new Schema(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requesterName: { type: String, required: true },
    responderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    responderName: { type: String, required: true },
    offeredSlot: {
      eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
      title: String,
      start: String,
      end: String,
    },
    requestedSlot: {
      eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
      title: String,
      start: String,
      end: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const SwapRequest: Model<ISwapRequest> = mongoose.model<ISwapRequest>(
  "SwapRequest",
  SwapRequestSchema
);

export default SwapRequest;
