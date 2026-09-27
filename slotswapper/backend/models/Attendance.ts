import mongoose, {
  Document,
  Schema,
  Model,
} from "mongoose";

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Free";

export interface IAttendance extends Document {
  facultyId: mongoose.Types.ObjectId;
  date: Date;
  day: string;
  periodNumber: number;
  subject: string;
  className: string;
  room?: string;
  completionTimestamp?: Date;
  status: AttendanceStatus;
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

    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    subject: {
      type: String,
      default: "",
    },

    className: {
      type: String,
      default: "",
    },

    room: {
      type: String,
      default: "",
    },

    completionTimestamp: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Free"],
      default: "Present",
      required: true,
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ facultyId: 1, date: 1, periodNumber: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;