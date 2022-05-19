import { Flex, Box } from "@chakra-ui/react";
import { memo, MutableRefObject } from "react";
import { generateId } from "../utils/generateId";
import { Message } from "./Message";

interface Message {
  user: {
    name: string;
    email: string;
    image: string;
  };
  text: string;
}

interface MessagesProps {
  messages: Message[];
  email: string;
  messagesEndRef: MutableRefObject<any>;
}

function MessagesComponent({ messages, email, messagesEndRef }: MessagesProps) {
  return (
    <Flex flexDir="column" overflowY="auto" h="100%" mb="2">
      {messages.map((msg) => {
        return <Message msg={msg} email={email} key={generateId()} />;
      })}
      <Box ref={messagesEndRef} />
    </Flex>
  );
}

export const Messages = memo(MessagesComponent, (prevProps, nextProps) => {
  return prevProps.messages.length === nextProps.messages.length;
});
