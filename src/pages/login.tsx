import { Button, Flex, Heading } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";

export default function Login() {
  return (
    <Flex justify="center" align="center" flexDir="column" h="90vh">
      <Heading>Fazer login</Heading>
      <Button onClick={() => signIn("google")} mt="6">
        Sign in
      </Button>
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
