import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "../../../schemas/user";
import { connectMongo } from "../../../services/connectMongo";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectMongo();

        const userInDB = await User.findOne({ email: user.email });

        if (userInDB) {
          return true;
        }

        const newUser = new User({
          name: user.name,
          email: user.email,
          image: user.image,
          rooms: [],
        });

        await newUser.save();

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});
