import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />

          <Route path="auth" element={<AuthPage />} />

          <Route path="r/:roomId" element={<RoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
