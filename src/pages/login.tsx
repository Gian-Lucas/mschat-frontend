import { GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";

import styles from "./login.module.scss";

export default function Login() {
  return (
    <div className={styles.container}>
      <h1>Fazer login</h1>
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
