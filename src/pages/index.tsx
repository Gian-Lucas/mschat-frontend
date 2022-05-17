import styles from "./home.module.scss";

import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import CopyToClipboard from "react-copy-to-clipboard";
import { MdOutlineContentCopy } from "react-icons/md";
import { TiArrowBack } from "react-icons/ti";

import { getSession, signOut, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { FormEvent } from "react";
import { generateId } from "../utils/generateId";
import { api } from "../services/api";
import { BallTriangle } from "react-loader-spinner";
import { toast } from "react-toastify";

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
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [userInRoomsAsGuest, setUserInRoomsAsGuest] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // console.log(messages);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    (async () => {
      if (session) {
        if (!userInRoomsAsGuest) {
          const result = await api.post("/rooms", {
            email: session.user.email,
          });
          const roomsData = !result.data.error ? result.data.rooms : [];
          setRooms(roomsData);
          setLoadingRooms(false);
        }
      }
    })();
  }, [session]);

  useEffect(() => {
    const newSocket = io(process.env.BACKEND_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  if (status === "loading") {
    // console.log("check status");
    return (
      <div className="loading-session">
        <BallTriangle
          width="100"
          color="#112d4e"
          ariaLabel="loading-session-indicator"
        />
      </div>
    );
  }

  if (socket) {
    if (message === "") {
      // console.log("salve");
      socket.on("receive_message", (msg: Message) => {
        // console.log(`${msg.user.name}: ${msg.text}`);
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
      roomCode: currentRoom.code,
    });

    setMessage("");
  }

  function joinInRoom(code: string) {
    socket.emit("join_room", code);
  }

  async function handleCreateRoom() {
    const room = prompt("Nome da sala");

    if (!room) return;

    const result = await api.post("/create/room", {
      room,
      email: session.user.email,
    });

    if (result.data.error) {
      toast.error(result.data.message);
      return;
    }
    toast.success(result.data.message, {
      autoClose: 1500,
    });

    // console.log(result.data.room);
    setRooms([...rooms, result.data.room]);

    handleSetCurrentRoom(result.data.room);
  }

  function handleSetCurrentRoom(room: Room) {
    if (room.code === currentRoom?.code) {
      return;
    }

    socket.on("room_messages", (messagesRoom: Message[]) => {
      setMessages(messagesRoom);
    });

    setCurrentRoom(room);
    joinInRoom(room.code);
  }

  async function handleEnterInRoom() {
    const roomCode = prompt("Código da sala");

    if (!roomCode) return;

    if (currentRoom) {
      if (roomCode === currentRoom.code) {
        toast.warn("Você já está na sala!");
        return;
      }
    }

    const roomExistsInUserRooms = rooms.find((room) => room.code === roomCode);

    if (roomExistsInUserRooms) {
      handleSetCurrentRoom(roomExistsInUserRooms);
      return;
    }

    const { data } = await api.get("/rooms/all");

    if (data.error) {
      toast.error("Falha ao entrar na sala!");
      return;
    }

    const roomExists = data.rooms.find((room: Room) => room.code === roomCode);

    if (!roomExists) {
      toast.error("Essa sala não existe, verifique se o código está correto.");
      return;
    }

    setRooms([...rooms, roomExists]);
    joinInRoom(roomCode);
    handleSetCurrentRoom(roomExists);
    setUserInRoomsAsGuest(true);
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.info}>
          <div className={styles.logo}>
            <h1
              onClick={() => {
                setCurrentRoom(null);
              }}
            >
              MSchat
            </h1>
          </div>
          {!currentRoom && (
            <button className={styles.logout} onClick={() => signOut()}>
              Sair
            </button>
          )}
          {currentRoom && (
            <div className={styles.profile}>
              <div>
                <img src={session.user.image} alt={session.user.name} />
                <div>
                  <strong>{currentRoom.title}</strong>
                  <span>
                    Código: {currentRoom.code} &nbsp;
                    <CopyToClipboard
                      style={{ cursor: "pointer" }}
                      text={currentRoom.code}
                      onCopy={() => {
                        toast.success("Código copiado!", { autoClose: 1500 });
                      }}
                    >
                      <MdOutlineContentCopy className={styles.iconCopy} />
                    </CopyToClipboard>
                  </span>
                </div>
              </div>
              <TiArrowBack
                className={styles.backToHome}
                onClick={() => {
                  setCurrentRoom(null);
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.roomsAndChat}>
          <aside className={styles.rooms}>
            {loadingRooms ? (
              <>
                Carregando salas
                <BallTriangle
                  width="50"
                  color="#112d4e"
                  ariaLabel="loading-rooms-indicator"
                />
              </>
            ) : (
              <>
                {rooms.map((room) => {
                  return (
                    <div
                      className={styles.room}
                      key={room.id}
                      onClick={() => handleSetCurrentRoom(room)}
                    >
                      <img src={session.user.image} alt={room.title} />
                      <div>
                        <strong>{room.title}</strong>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </aside>

          {currentRoom ? (
            <main className={styles.chat}>
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
                        <strong>
                          {msg.user.email === session.user.email
                            ? ""
                            : msg.user.name + " "}
                        </strong>
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
            </main>
          ) : (
            <div className={styles.containerButtonNewRoom}>
              <h1>Suas mensagens</h1>
              <button onClick={handleCreateRoom}>Criar nova sala</button>
              <button onClick={handleEnterInRoom}>Entrar em uma sala</button>
            </div>
          )}
        </div>
      </div>
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
