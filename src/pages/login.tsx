import { GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <button onClick={() => signIn("google")}>Sign in</button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
