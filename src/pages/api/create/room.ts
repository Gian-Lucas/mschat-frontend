import { NextApiRequest, NextApiResponse } from "next";
import { User } from "../../../schemas/user";
import { connectMongo } from "../../../services/connectMongo";
import { generateId } from "../../../utils/generateId";

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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { room, email } = req.body;
      await connectMongo();

      const user = await User.findOne<IUser>({ email });

      const roomAlreadyExists = user.rooms.find(
        (userRoom) => userRoom.title === room
      );

      if (roomAlreadyExists) {
        return res.json({
          error: true,
          message: "Já existe uma sala com esse nome!",
        });
      }

      const newRoom = {
        id: generateId(),
        title: room,
        code: generateId(),
      };

      const addRoom = await User.findOneAndUpdate(
        { email },
        {
          rooms: [...user.rooms, newRoom],
        }
      );

      console.log(addRoom);

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
