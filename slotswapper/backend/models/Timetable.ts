import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPeriod {
  periodNumber: number;
  subject: string;
  startTime: string;
  endTime: string;
  className: string;
  room?: string;
}

export interface IDaySchedule {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  periods: IPeriod[];
}

export interface ITimetable extends Document {
  facultyId: mongoose.Types.ObjectId;
  college: string;
  schedule: IDaySchedule[];
  createdAt?: Date;
  updatedAt?: Date;
}

const TimetableSchema: Schema<ITimetable> = new Schema(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    college: {
      type: String,
      required: true,
    },

    schedule: [
      {
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

        periods: [
          {
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

            startTime: {
              type: String,
              required: true,
            },

            endTime: {
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
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Timetable: Model<ITimetable> = mongoose.model<ITimetable>(
  "Timetable",
  TimetableSchema
);

export default Timetable;