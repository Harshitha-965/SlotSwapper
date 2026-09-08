import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMondayRotation extends Document {
  weekStart: Date;
  mondayOrder: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  setBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const MondayRotationSchema: Schema<IMondayRotation> = new Schema(
  {
    weekStart: {
      type: Date,
      required: true,
      unique: true,
    },

    mondayOrder: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: true,
    },

    setBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MondayRotation: Model<IMondayRotation> =
  mongoose.model<IMondayRotation>(
    "MondayRotation",
    MondayRotationSchema
  );

export default MondayRotation;