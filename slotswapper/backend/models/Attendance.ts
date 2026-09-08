import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAttendance extends Document {
  facultyId: mongoose.Types.ObjectId;
  date: Date;
  day: string;
  periodNumber: number;
  subject: string;
  className: string;
  room?: string;
  completionTimestamp?: Date;
  status: "Present" | "Absent" | "Free";
  createdAt?: Date;
  updatedAt?: Date;
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    day: {
      type: String,
      required: true,
    },

    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    subject: {
      type: String,
      required: true,
    },

    className: {
      type: String,
      required: true,
    },

    room: {
      type: String,
    },

    completionTimestamp: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Free"],
      required: true,
    },
  },
  { timestamps: true }
);

const Attendance: Model<IAttendance> = mongoose.model<IAttendance>(
  "Attendance",
  AttendanceSchema
);

export default Attendance;