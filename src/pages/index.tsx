import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import { getSession, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { FormEvent } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import {
  Button,
  Flex,
  Grid,
  Heading,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { RoomsList } from "../components/RoomsList";
import { Messages } from "../components/Messages";
import { Menu } from "../components/Menu";
import { Form } from "../components/Form";
import { HeaderRoom } from "../components/HeaderRoom";

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
  const isDesktop = useBreakpointValue({ md: true });

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
    const url =
      process.env.NODE_ENV === "development"
        ? "http://localhost:8080/"
        : "https://mschat-back.herokuapp.com/";
    const newSocket = io(url);
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
    <Flex flexDir="column" p="2" maxW="1080" mx="auto">
      <Flex justify="space-between">
        {!isDesktop ? (
          <RoomsList
            rooms={rooms}
            handleSetCurrentRoom={handleSetCurrentRoom}
            loadingRooms={loadingRooms}
          />
        ) : (
          <Heading onClick={() => setCurrentRoom(null)} cursor="pointer">
            MSchat
          </Heading>
        )}
        <Menu
          handleCreateRoom={handleCreateRoom}
          handleEnterInRoom={handleEnterInRoom}
        />
      </Flex>

      <Grid mt="5" templateColumns={isDesktop ? "1fr 3fr" : "1fr"}>
        {isDesktop && (
          <RoomsList
            rooms={rooms}
            handleSetCurrentRoom={handleSetCurrentRoom}
            loadingRooms={loadingRooms}
          />
        )}

        <Flex flex="1" justify="center" align="center">
          {currentRoom ? (
            <Flex flexDir="column" align="center" p="1" w="100%">
              <HeaderRoom currentRoom={currentRoom} />

              <Flex flexDir="column" justify="flex-end" w="100%" h="77vh">
                <Messages
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                  email={session.user.email}
                />

                <Form
                  message={message}
                  sendMessage={sendMessage}
                  setMessage={setMessage}
                />
              </Flex>
            </Flex>
          ) : (
            <Flex align="center" flexDir="column" mt="20">
              <Heading>MSchat</Heading>
              <Button mt="8" onClick={handleCreateRoom}>
                Criar uma nova sala
              </Button>
              <Button mt="5" onClick={handleEnterInRoom}>
                Entrar em uma sala
              </Button>
            </Flex>
          )}
        </Flex>
      </Grid>
    </Flex>
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
