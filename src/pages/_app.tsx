import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import "../styles/globals.scss";

function MyApp({ Component, pageProps: { session, pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
