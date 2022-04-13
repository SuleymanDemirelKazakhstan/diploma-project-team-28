import React, { useCallback, useEffect, useState } from "react";

import { User } from "../types";

interface IUserContext {
  user?: User;
  setUserInfo: (userInfo: User) => void;
}

export const UserContext = React.createContext<IUserContext>({
  user: undefined,
  setUserInfo: (userInfo: User) => {},
});

export const UserContextProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();

  const setUserInfo = useCallback((userInfo: User) => {
    setUser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
  }, []);

  useEffect(() => {
    const userFromStorage = localStorage.getItem("user");

    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
