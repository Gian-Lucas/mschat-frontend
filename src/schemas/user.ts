import { Schema, model, models } from "mongoose";

interface IUser {
  name: string;
  email: string;
  image: string;
  rooms: Array<{
    id: string;
    title: string;
    code: string;
  }>;
}

const userSchema = new Schema<IUser>({
  name: String,
  email: String,
  image: String,
  rooms: Array,
});

export const User = models.User || model("User", userSchema);
