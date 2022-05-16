import { Schema, model, models } from "mongoose";

interface IRoom {
  id: string;
  title: string;
  code: string;
  userEmail: string;
}

const roomSchema = new Schema<IRoom>({
  id: String,
  title: String,
  code: String,
  userEmail: String,
});

export const Room = models.Room || model("Room", roomSchema);
