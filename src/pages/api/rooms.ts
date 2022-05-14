import { NextApiRequest, NextApiResponse } from "next";
import { User } from "../../schemas/user";
import { connectMongo } from "../../services/connectMongo";

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
      const { email } = req.body;
      await connectMongo();

      const user = await User.findOne<IUser>({ email });

      return res.json({ error: false, rooms: user.rooms });
    } catch (error) {
      console.log(error);
      return res.json({ error: true, message: "get rooms failed" });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Methond not allowed");
  }
};
