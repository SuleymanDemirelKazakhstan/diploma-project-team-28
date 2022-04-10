import React from "react";
import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";

const MainLayout = () => {
  return (
    <Flex flexDirection="column" height="100vh">
      <AppHeader />

      <Flex as="main" flexDirection="column" flex="1">
        <Outlet />
      </Flex>
    </Flex>
  );
};

export default MainLayout;
