import { Flex, Avatar, Text } from "@chakra-ui/react";

interface MessageType {
  user: {
    name: string;
    email: string;
    image: string;
  };
  text: string;
}

interface MessageProps {
  email: string;
  msg: MessageType;
}

export function Message({ msg, email }: MessageProps) {
  return (
    <Flex
      mt="4"
      ml={msg.user.email === email ? "auto" : ""}
      maxW="85%"
      w="fit-content"
      flexDir="column"
    >
      <Flex
        align="center"
        justify={msg.user.email === email ? "flex-end" : "flex-start"}
      >
        <Avatar mr="1" boxSize="5" name={msg.user.name} src={msg.user.image} />
        <Text fontSize="12">
          {msg.user.email === email ? "" : msg.user.name}
        </Text>
      </Flex>

      <Text
        borderRadius="lg"
        p="2"
        mt="2"
        bg={msg.user.email === email ? "blue.900" : "gray.700"}
      >
        {msg.text}
      </Text>
    </Flex>
  );
}


