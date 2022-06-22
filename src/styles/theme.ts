import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: "Roboto, sans-serif",
    body: "Roboto, sans-serif",
  },
  styles: {
    global: {
      html: {
        scrollBehavior: "smooth",
      },
    },
  },
});
