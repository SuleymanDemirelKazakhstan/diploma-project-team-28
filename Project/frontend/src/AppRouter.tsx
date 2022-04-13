import React, { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { UserContext } from "./context/UserContext";

import MainLayout from "./layouts/MainLayout";
import ChatPage from "./pages/ChatPage";
import ChatRoom from "./pages/ChatRoom";
import LoginPage from "./pages/LoginPage";

const AppRouter = () => {
  const { user } = useContext(UserContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LoginPage />} />

          <Route path="r" element={user ? <ChatPage /> : <h1>Loading...</h1>} />
          <Route path="r/:roomId" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
