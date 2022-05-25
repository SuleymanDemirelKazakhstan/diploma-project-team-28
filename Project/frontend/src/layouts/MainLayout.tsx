import React, { useContext } from "react";
import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { UserContext } from "../context/UserContext";

const MainLayout = () => {
  const userContext = useContext(UserContext);

  return (
    <Flex flexDirection="column" height="100vh">
      <AppHeader />

      <Flex as="main" flexDirection="column" flex="1">
        {userContext.loading ? "LOADING..." : <Outlet />}
      </Flex>
    </Flex>
  );
};

export default MainLayout;
