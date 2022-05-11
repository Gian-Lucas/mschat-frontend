import styles from "./home.module.scss";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  if (socket) {
    socket.on("enter", (msg) => {
      console.log(msg);
    });
    socket.on("exit", (msg) => {
      console.log(msg);
    });
  }

  if (status === "loading") {
    return <span>Fazendo login...</span>;
  }

  return (
    <div className={styles.container}>
      <h1>Hello World!</h1>
      {session ? (
        <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <>
          Not signed in <br />
          <button onClick={() => signIn("google")}>Sign in</button>
        </>
      )}
    </div>
  );
}
