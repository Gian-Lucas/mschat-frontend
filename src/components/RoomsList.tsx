import {
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  IconButton,
  Text,
  Flex,
  Avatar,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { useRef } from "react";
import { FiMenu } from "react-icons/fi";

interface Room {
  id: string;
  title: string;
  code: string;
}

interface RoomsListProps {
  rooms: Room[];
  handleSetCurrentRoom: (room: Room) => void;
  loadingRooms: boolean;
}

export function RoomsList({
  rooms,
  handleSetCurrentRoom,
  loadingRooms,
}: RoomsListProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  return (
    <>
      <IconButton
        bg="gray.700"
        aria-label="Open rooms list"
        icon={<FiMenu />}
        ref={btnRef}
        onClick={onOpen}
      />

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent bg="gray.700">
          <DrawerCloseButton bg="gray.700" />
          <DrawerHeader>Salas</DrawerHeader>

          <DrawerBody>
            <>
              {loadingRooms ? (
                <Spinner />
              ) : (
                <Box>
                  {rooms.length === 0 && <Text>Nenhuma sala</Text>}
                  {rooms.map((room) => {
                    return (
                      <Flex
                        key={room.id}
                        align="center"
                        mt="2"
                        onClick={() => {
                          handleSetCurrentRoom(room);
                          onClose();
                        }}
                      >
                        <Avatar name={room.title} />
                        <Text ml="2">{room.title}</Text>
                      </Flex>
                    );
                  })}
                </Box>
              )}
            </>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
