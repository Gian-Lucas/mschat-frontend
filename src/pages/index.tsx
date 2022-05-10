// import { socket } from "../services/socket";
import styles from "./home.module.scss";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

export default function Home() {
  const [socket, setSocket] = useState<Socket>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  socket?.on("enter", (msg) => {
    console.log(msg);
  });
  socket?.on("exit", (msg) => {
    console.log(msg);
  });

  return (
    <div className={styles.container}>
      <h1>Hello World!</h1>
    </div>
  );
}
