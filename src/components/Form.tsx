import { Flex, Input, Button } from "@chakra-ui/react";
import { FormEvent } from "react";

interface FormProps {
  sendMessage: (e: FormEvent<HTMLFormElement>, text: string) => void;
  setMessage: (msg: string) => void;
  message: string;
}

export function Form({ sendMessage, setMessage, message }: FormProps) {
  return (
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
  );
}
