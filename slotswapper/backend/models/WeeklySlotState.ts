import mongoose, {
  Document,
  Schema,
  Model,
} from "mongoose";

export type SlotStatus =
  | "Busy"
  | "Swappable"
  | "Emergency";

export interface IWeeklySlot {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";

  periodNumber: number;
  status: SlotStatus;
}

export interface IWeeklySlotState
  extends Document {
  facultyId: mongoose.Types.ObjectId;
  weekStart: Date;
  slots: IWeeklySlot[];
  createdAt?: Date;
  updatedAt?: Date;
}

const WeeklySlotSchema =
  new Schema<IWeeklySlot>(
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

      periodNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 7,
      },

      status: {
        type: String,
        enum: [
          "Busy",
          "Swappable",
          "Emergency",
        ],
        required: true,
        default: "Busy",
      },
    },
    {
      _id: false,
    }
  );

const WeeklySlotStateSchema: Schema<IWeeklySlotState> =
  new Schema(
    {
      facultyId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      weekStart: {
        type: Date,
        required: true,
      },

      slots: {
        type: [WeeklySlotSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

WeeklySlotStateSchema.index(
  {
    facultyId: 1,
    weekStart: 1,
  },
  {
    unique: true,
  }
);

const WeeklySlotState: Model<IWeeklySlotState> =
  mongoose.model<IWeeklySlotState>(
    "WeeklySlotState",
    WeeklySlotStateSchema
  );

export default WeeklySlotState;