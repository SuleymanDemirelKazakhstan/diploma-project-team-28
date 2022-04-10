import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

import AppRouter from "./AppRouter";
import { UserContextProvider } from "./context/UserContext";

function App() {
  return (
    <ChakraProvider>
      <UserContextProvider>
        <AppRouter />
      </UserContextProvider>
    </ChakraProvider>
  );
}

export default App;
