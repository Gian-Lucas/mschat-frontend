import styles from "./home.module.scss";

import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import { getSession, useSession } from "next-auth/react";
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

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log(messages);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  if (status === "loading") {
    return <span>Fazendo login...</span>;
  }

  if (socket) {
    socket.on("receive_message", (msg: Message) => {
      console.log(`${msg.user.name}: ${msg.text}`);
      setMessages([
        ...messages,
        {
          user: {
            name: msg.user.name,
            email: msg.user.email,
            image: msg.user.image,
          },
          text: msg.text,
        },
      ]);
    });
  }

  function sendMessage(e: FormEvent<HTMLFormElement>, text: string) {
    e.preventDefault();

    socket.emit("send_message", {
      user: session.user,
      text,
    });

    setMessage("");
  }

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.logo}>
          <h1>MSchat</h1>
        </div>
        <div className={styles.profile}>
          <img
            src="https://lh3.googleusercontent.com/a-/AOh14GiitBijx-Lv6w9hwV8en8koNBGvwhHK6cmCQfTdJg=s96-c"
            alt="Gian"
          />

          <strong>Gian Lucas</strong>
        </div>
      </div>

      <hr />

      <div className={styles.contactsAndChat}>
        <div className={styles.contacts}>
          <div className={styles.contact}>
            <img
              src="https://lh3.googleusercontent.com/a-/AOh14GiitBijx-Lv6w9hwV8en8koNBGvwhHK6cmCQfTdJg=s96-c"
              alt="Gian"
            />
            <div>
              <strong>Gian Lucas</strong>
              <span>Lorem ipsum dolor sit amet elit.</span>
            </div>
          </div>
          <div className={styles.contact}>
            <img
              src="https://lh3.googleusercontent.com/a-/AOh14GiitBijx-Lv6w9hwV8en8koNBGvwhHK6cmCQfTdJg=s96-c"
              alt="Gian"
            />
            <div>
              <strong>Gian Lucas</strong>
              <span>Lorem ipsum dolor sit amet elit.</span>
            </div>
          </div>
          <div className={styles.contact}>
            <img
              src="https://lh3.googleusercontent.com/a-/AOh14GiitBijx-Lv6w9hwV8en8koNBGvwhHK6cmCQfTdJg=s96-c"
              alt="Gian"
            />
            <div>
              <strong>Gian Lucas</strong>
              <span>Lorem ipsum dolor sit amet elit.</span>
            </div>
          </div>
          <div className={styles.contact}>
            <img
              src="https://lh3.googleusercontent.com/a-/AOh14GiitBijx-Lv6w9hwV8en8koNBGvwhHK6cmCQfTdJg=s96-c"
              alt="Gian"
            />
            <div>
              <strong>Gian Lucas</strong>
              <span>Lorem ipsum dolor sit amet elit.</span>
            </div>
          </div>
        </div>

        <div className={styles.chat}>
          <div id="messages" className={styles.messages}>
            {messages.map((msg) => {
              return (
                <div
                  className={
                    msg.user.email === session.user.email
                      ? styles.sent
                      : styles.receive
                  }
                >
                  <span style={{ display: "block" }}>
                    {/* <strong>{msg.user.name} </strong> */}
                    {msg.text}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => sendMessage(e, message)}>
            <input
              type="text"
              required
              placeholder="Mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
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
