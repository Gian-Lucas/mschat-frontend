import { Schema, model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  image: string;
}

const userSchema = new Schema<IUser>({
  name: String,
  email: String,
  image: String,
});

export const User = model("User", userSchema);
