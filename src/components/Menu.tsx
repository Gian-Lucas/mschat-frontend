import {
  Menu as MenuChakra,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  useColorMode,
} from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { MdAdd } from "react-icons/md";

interface MenuProps {
  handleCreateRoom: () => Promise<void>;
  handleEnterInRoom: () => Promise<void>;
}

export function Menu({ handleCreateRoom, handleEnterInRoom }: MenuProps) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <MenuChakra>
      <MenuButton
        autoFocus={false}
        as={IconButton}
        aria-label="Menu"
        icon={<MdAdd />}
      />
      <MenuList>
        <MenuItem onClick={handleCreateRoom}>Criar uma nova sala</MenuItem>
        <MenuItem onClick={handleEnterInRoom}>Entrar em uma sala</MenuItem>
        <MenuItem onClick={toggleColorMode}>
          Tema {colorMode === "light" ? "Escuro" : "Claro"}
        </MenuItem>
        <MenuItem onClick={() => signOut()}>Deslogar</MenuItem>
      </MenuList>
    </MenuChakra>
  );
}
