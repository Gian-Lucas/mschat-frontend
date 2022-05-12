import styles from "./home.module.scss";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

import { getSession, signOut, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { FormEvent } from "react";

interface Message {
  user: {
    name: string;
    email: string;
    image: string;
  };
  text: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket>(null);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (msg: Message) => {
        console.log(`${msg.user.name}: ${msg.text}`);
      });
    }
  }, [socket]);

  if (status === "loading") {
    return <span>Fazendo login...</span>;
  }

  function sendMessage(e: FormEvent<HTMLFormElement>, text: string) {
    e.preventDefault();

    socket.emit("send_message", {
      user: session.user,
      text,
    });

    setMessage("");
    setMessages([
      ...messages,
      {
        user: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
        text,
      },
    ]);
  }

  return (
    <div className={styles.container}>
      <h1>Hello World!</h1>
      Signed in as {session.user.email} <br />
      <button onClick={() => signOut()}>Sign out</button>
      <form onSubmit={(e) => sendMessage(e, message)}>
        <input
          type="text"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
      <div className="messages">
        {messages.map((msg) => {
          return (
            <span style={{ display: "block" }}>
              <strong>{msg.user.name} </strong>
              {msg.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
