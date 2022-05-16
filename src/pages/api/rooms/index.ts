import { NextApiRequest, NextApiResponse } from "next";
import { Room } from "../../../schemas/room";
import { connectMongo } from "../../../services/connectMongo";

interface IRoom {
  id: string;
  title: string;
  code: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { email } = req.body;
      await connectMongo();

      const rooms = await Room.find<IRoom>({ userEmail: email });

      return res.json({ error: false, rooms });
    } catch (error) {
      console.log(error);
      return res.json({ error: true, message: "get rooms failed" });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Methond not allowed");
  }
};
