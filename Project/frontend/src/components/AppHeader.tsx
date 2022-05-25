import React, { useContext } from "react";
import { Avatar, Flex, Image, Stack, Text } from "@chakra-ui/react";

import { UserContext } from "../context/UserContext";

const AppHeader = () => {
  const userContext = useContext(UserContext);

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      paddingX="48px"
      backgroundColor="#EF5525"
      color="white"
      height="64px"
    >
      <Text as="h1" fontSize="24px" fontWeight="800">
        ChatRoom
      </Text>

      {userContext.user && (
        <Stack direction="row" spacing="8px" alignItems="center">
          <Text fontSize="14px" fontWeight="bold">
            {userContext.user.name}
          </Text>

          <Avatar
            size="md"
            name={userContext.user.name}
            src={userContext.user.avatar}
          />
        </Stack>
      )}
    </Flex>
  );
};

export default AppHeader;
