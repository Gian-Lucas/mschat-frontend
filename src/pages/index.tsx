import styles from "./home.module.scss";

import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import CopyToClipboard from "react-copy-to-clipboard";
import { MdOutlineContentCopy } from "react-icons/md";

import { getSession, signOut, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { FormEvent } from "react";
import { generateId } from "../utils/generateId";
import { api } from "../services/api";

interface Message {
  user: {
    name: string;
    email: string;
    image: string;
  };
  text: string;
}

interface Room {
  id: string;
  title: string;
  code: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket>(null);
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState(null);
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
    (async () => {
      if (session) {
        const result = await api.post("/rooms", {
          email: session.user.email,
        });
        const roomsData = !result.data.error ? result.data.rooms : [];
        setRooms(roomsData);
      }
    })();
  }, [session]);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  if (status === "loading") {
    console.log("check status");
    return <span>Fazendo login...</span>;
  }

  if (socket) {
    if (message === "") {
      console.log("salve");
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
  }

  function sendMessage(e: FormEvent<HTMLFormElement>, text: string) {
    e.preventDefault();

    socket.emit("send_message", {
      user: session.user,
      text,
    });

    setMessage("");
  }

  async function handleCreateRoom() {
    const room = prompt("Nome da sala");

    const result = await api.post("/create/room", {
      room,
      email: session.user.email,
    });

    alert(result.data.message);

    if (result.data.error) {
      return;
    }

    console.log(result.data.room);
    setRooms([...rooms, result.data.room]);

    setCurrentRoom(result.data.room.title);
  }

  function handleEnterInRoom() {
    const roomCode = prompt("Código da sala");

    console.log(roomCode);
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.info}>
          <div className={styles.logo}>
            <h1>MSchat</h1>
          </div>
          {currentRoom && (
            <div className={styles.profile}>
              <img src={session.user.image} alt={session.user.name} />

              <strong>{currentRoom}</strong>
            </div>
          )}
        </div>

        <div className={styles.roomsAndChat}>
          <div className={styles.rooms}>
            {rooms.map((room) => {
              return (
                <div
                  className={styles.room}
                  key={room.id}
                  onClick={() => setCurrentRoom(room.title)}
                >
                  <img src={session.user.image} alt={room.title} />
                  <div>
                    <strong>{room.title}</strong>
                    <span>
                      Código: {room.code} &nbsp;
                      <CopyToClipboard
                        text={room.code}
                        onCopy={() => {
                          alert("Copiado!");
                        }}
                      >
                        <MdOutlineContentCopy className={styles.iconCopy} />
                      </CopyToClipboard>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentRoom ? (
            <div className={styles.chat}>
              <div id="messages" className={styles.messages}>
                {messages.map((msg) => {
                  return (
                    <div
                      key={generateId()}
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
          ) : (
            <div className={styles.containerButtonNewRoom}>
              <h1>Suas mensagens</h1>
              <button onClick={handleCreateRoom}>Criar nova sala</button>
              <button onClick={handleEnterInRoom}>Entrar em uma sala</button>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => signOut()}>Sair</button>
      <button onClick={handleCreateRoom}>Criar nova sala</button>
    </>
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
