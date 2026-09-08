import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  college: "RMK Engineering College" | "RMD Engineering College" | "RMKCET Engineering College";
  role: "Admin" | "Faculty";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    college: {
      type: String,
      enum: [
        "RMK Engineering College",
        "RMD Engineering College",
        "RMKCET Engineering College",
      ],
      required: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Faculty"],
      default: "Faculty",
      required: true,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;