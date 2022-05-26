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
  useBreakpointValue,
  Heading,
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
  const isDesktop = useBreakpointValue({ md: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  if (isDesktop) {
    return (
      <Box>
        {rooms.length === 0 ? (
          <Text>Nenhuma sala</Text>
        ) : (
          <Heading fontSize="3xl">Salas</Heading>
        )}
        {rooms.map((room) => {
          return (
            <Flex
              cursor="pointer"
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
    );
  }

  return (
    <>
      <IconButton
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
        <DrawerContent>
          <DrawerCloseButton />
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
