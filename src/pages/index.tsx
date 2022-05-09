import { socket } from "../services/socket";
import styles from "./home.module.scss";

export default function Home() {
  socket.on("entered", (msg) => {
    console.log(msg);
  });

  return (
    <div className={styles.container}>
      <h1>Hello World!</h1>
    </div>
  );
}
