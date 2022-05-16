import { Schema, model, models } from "mongoose";

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

export const User = models.User || model("User", userSchema);
