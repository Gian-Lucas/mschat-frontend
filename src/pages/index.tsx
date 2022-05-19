import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import CopyToClipboard from "react-copy-to-clipboard";
import { MdAdd, MdOutlineContentCopy } from "react-icons/md";

import { getSession, signOut, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { FormEvent } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
} from "@chakra-ui/react";
import { RoomsList } from "../components/RoomsList";
import { Messages } from "../components/Messages";

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
    const newSocket = io("https://mschat-back.herokuapp.com/");
    // const newSocket = io("http://localhost:8080/");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  if (status === "loading") {
    // console.log("check status");
    return (
      <Flex h="90vh" justify="center" align="center">
        <Spinner />
      </Flex>
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

    if (text === "") {
      console.log("pode n");
      return;
    }

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
      <Flex flexDir="column" p="2">
        <Flex justify="space-between">
          <RoomsList
            rooms={rooms}
            handleSetCurrentRoom={handleSetCurrentRoom}
            loadingRooms={loadingRooms}
          />

          <Menu>
            <MenuButton as={IconButton} aria-label="Menu" icon={<MdAdd />} />
            <MenuList>
              <MenuItem onClick={handleCreateRoom}>
                Criar uma nova sala
              </MenuItem>
              <MenuItem onClick={handleEnterInRoom}>
                Entrar em uma sala
              </MenuItem>
              <MenuItem onClick={() => signOut()}>Deslogar</MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <Flex justify="center" align="center" mt="4">
          {currentRoom ? (
            <Flex flexDir="column" align="center" p="1" w="100%">
              <Flex align="center" justify="space-between" w="100%">
                <Heading>{currentRoom.title}</Heading>
                <Flex align="center" fontSize="14">
                  {currentRoom.code} &nbsp;
                  <CopyToClipboard
                    style={{ cursor: "pointer" }}
                    text={currentRoom.code}
                    onCopy={() => {
                      toast.success("Código copiado!", { autoClose: 1500 });
                    }}
                  >
                    <MdOutlineContentCopy />
                  </CopyToClipboard>
                </Flex>
              </Flex>

              <Flex flexDir="column" justify="flex-end" w="100%" h="75vh">
                <Messages
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                  email={session.user.email}
                />

                <form onSubmit={(e) => sendMessage(e, message)}>
                  <Flex>
                    <Input
                      fontSize="14"
                      placeholder="Mensagem..."
                      mr="2"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button fontSize="14" type="submit">
                      Enviar
                    </Button>
                  </Flex>
                </form>
              </Flex>
            </Flex>
          ) : (
            <Heading mt="10">MSchat</Heading>
          )}
        </Flex>
      </Flex>

      {/* <div>
        <div>
          <div>
            <h1
              onClick={() => {
                setCurrentRoom(null);
              }}
            >
              MSchat
            </h1>
          </div>
          {!currentRoom && <button onClick={() => signOut()}>Sair</button>}
          {currentRoom && (
            <div>
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
                      <MdOutlineContentCopy />
                    </CopyToClipboard>
                  </span>
                </div>
              </div>
              <TiArrowBack
                onClick={() => {
                  setCurrentRoom(null);
                }}
              />
            </div>
          )}
        </div>

        <div>
          <aside>
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
            <main>
              <div id="messages">
                {messages.map((msg) => {
                  return (
                    <div key={generateId()}>
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
            <div>
              <h1>Suas mensagens</h1>
              <button onClick={handleCreateRoom}>Criar nova sala</button>
              <button onClick={handleEnterInRoom}>Entrar em uma sala</button>
            </div>
          )}
        </div>
      </div> */}
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
