import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  start: string;
  end: string;
  status: "Busy" | "Swappable";
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
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
      enum: ["Busy", "Swappable"],
      default: "Busy",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerName: { type: String, required: true },
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema);

export default Event;
