import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  start: string;
  end: string;
  status: "Busy" | "Swappable" | "Emergency" | "Free";
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  day?: string;
  periodNumber?: number;
  subject?: string;
  className?: string;
  room?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    status: {
      type: String,
      enum: ["Busy", "Swappable", "Emergency", "Free"],
      default: "Busy",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerName: { type: String, required: true },
    day: { type: String },
    periodNumber: { type: Number },
    subject: { type: String },
    className: { type: String },
    room: { type: String },
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema);

export default Event;
