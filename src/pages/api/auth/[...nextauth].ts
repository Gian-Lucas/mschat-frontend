import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
        // salvar user no db, se não já tiver uma conta
        console.log("user: ", user);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});
