import { NextApiRequest, NextApiResponse } from "next";
import { Room } from "../../../schemas/room";
import { connectMongo } from "../../../services/connectMongo";
import { generateId } from "../../../utils/generateId";

interface IRoom {
  id: string;
  title: string;
  code: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { room, email } = req.body;
      await connectMongo();

      const roomInDB = await Room.findOne<IRoom>({ title: room });

      if (roomInDB) {
        return res.json({
          error: true,
          message: "Já existe uma sala com esse nome!",
        });
      }

      const newRoom = new Room({
        id: generateId(),
        title: room,
        code: generateId(),
        userEmail: email,
      });

      await newRoom.save();

      return res.json({
        error: false,
        message: "Sala criada com sucesso!",
        room: newRoom,
      });
    } catch (error) {
      console.log(error);
      return res.json({ error: true, message: "Falha ao criar sala" });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Methond not allowed");
  }
};
