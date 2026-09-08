import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISwapReport extends Document {
  requesterId: mongoose.Types.ObjectId;
  requesterName: string;

  responderId: mongoose.Types.ObjectId;
  responderName: string;

  originalSlot: {
    title: string;
    date: string;
    day: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
    className: string;
  };

  offeredSlot: {
    title: string;
    date: string;
    day: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
    className: string;
  };

  status:
    | "Requested"
    | "Accepted"
    | "Declined"
    | "Auto-Declined"
    | "Swapped";

  timestamp: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

const SwapReportSchema: Schema<ISwapReport> = new Schema(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requesterName: {
      type: String,
      required: true,
    },

    responderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    responderName: {
      type: String,
      required: true,
    },

    originalSlot: {
      title: String,
      date: String,
      day: String,
      periodNumber: Number,
      startTime: String,
      endTime: String,
      className: String,
    },

    offeredSlot: {
      title: String,
      date: String,
      day: String,
      periodNumber: Number,
      startTime: String,
      endTime: String,
      className: String,
    },

    status: {
      type: String,
      enum: [
        "Requested",
        "Accepted",
        "Declined",
        "Auto-Declined",
        "Swapped",
      ],
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SwapReport: Model<ISwapReport> = mongoose.model<ISwapReport>(
  "SwapReport",
  SwapReportSchema
);

export default SwapReport;