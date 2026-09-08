import mongoose, {
  Document,
  Schema,
  Model,
} from "mongoose";

export type AcademicDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface IPeriod {
  periodNumber: number;
  subject: string;
  startTime: string;
  endTime: string;
  className: string;
  room?: string;
}

export interface IDaySchedule {
  day: AcademicDay;
  periods: IPeriod[];
}

export interface ITimetable extends Document {
  facultyId: mongoose.Types.ObjectId;
  college: string;
  schedule: IDaySchedule[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PeriodSchema =
  new Schema<IPeriod>(
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
        default: "",
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
        default: "",
      },

      room: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const DayScheduleSchema =
  new Schema<IDaySchedule>(
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

      periods: {
        type: [PeriodSchema],
        required: true,
        validate: {
          validator: (
            periods: IPeriod[]
          ) =>
            periods.length === 7,

          message:
            "Each day must contain exactly 7 periods.",
        },
      },
    },
    {
      _id: false,
    }
  );

const TimetableSchema: Schema<ITimetable> =
  new Schema(
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

      schedule: {
        type: [DayScheduleSchema],
        required: true,

        validate: {
          validator: (
            schedule: IDaySchedule[]
          ) =>
            schedule.length === 6,

          message:
            "Timetable must contain Monday to Saturday.",
        },
      },
    },

    {
      timestamps: true,
    }
  );

const Timetable: Model<ITimetable> =
  mongoose.model<ITimetable>(
    "Timetable",
    TimetableSchema
  );

export default Timetable;