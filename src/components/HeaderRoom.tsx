import { Flex, Heading } from "@chakra-ui/react";
import { MdOutlineContentCopy } from "react-icons/md";
import { toast } from "react-toastify";
import CopyToClipboard from "react-copy-to-clipboard";

type Room = {
  id: string;
  title: string;
  code: string;
};

interface HeaderRoomProps {
  currentRoom: Room;
}

export function HeaderRoom({ currentRoom }: HeaderRoomProps) {
  return (
    <Flex align="center" justify="space-between" w="100%">
      <Heading>{currentRoom.title}</Heading>
      <Flex align="center" fontSize="16">
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
  );
}
