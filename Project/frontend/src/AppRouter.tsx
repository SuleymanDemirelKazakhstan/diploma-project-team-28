import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ChatRoom from "./pages/ChatRoom";
import LoginPage from "./pages/LoginPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LoginPage />} />

          <Route path="room/:roomId" element={<ChatRoom />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
