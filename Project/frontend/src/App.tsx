import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import DailyIframe from "@daily-co/daily-js";

import AppRouter from "./AppRouter";
import { UserContextProvider } from "./context/UserContext";

function App() {
  return (
    <ChakraProvider>
      {/* {DailyIframe.supportedBrowser().supported ? ( */}
      <UserContextProvider>
        <AppRouter />
      </UserContextProvider>
      {/* ) : (
        <h1>
          Looks like you need to upgrade your browser to make video calls.
        </h1>
      )} */}
    </ChakraProvider>
  );
}

export default App;
