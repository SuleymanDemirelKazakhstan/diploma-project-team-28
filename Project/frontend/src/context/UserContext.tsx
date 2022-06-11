import { useBoolean } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import Cookie from "js-cookie";

import { User } from "../types";

interface IUserContext {
  user?: User;
  loading: boolean;
  savedUsers: User[];
  setUserById: (id: string) => Promise<any>;
  createNewUser: (userInfo: User, remember?: boolean) => Promise<any>;
}

export const UserContext = React.createContext<IUserContext>({
  user: undefined,
  loading: true,
  savedUsers: [],
  setUserById: async (id: string) => {},
  createNewUser: async (userInfo: User) => {},
});

export const UserContextProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [savedUsers, setSavedUsers] = useState<User[]>([]);
  const [loading, { on: startLoading, off: stopLoading }] = useBoolean(true);

  const createNewUser = useCallback(
    (userInfo: User, remember: boolean = false) => {
      return new Promise<User>((resolve) => {
        const id = `${Date.now()}`;

        const newUser: User = {
          id: id,
          ...userInfo,
        };

        setUser(newUser);

        if (remember) {
          // Push new user to saved users
          localStorage.setItem(
            "users",
            JSON.stringify([newUser, ...savedUsers])
          );

          setSavedUsers((prev) => [newUser, ...prev]);

          // Set new user as last used
          Cookie.set("last-user-id", id, { expires: 7 });
        }

        resolve(newUser);
      });
    },
    [savedUsers]
  );

  const setUserById = useCallback(
    (id: string) => {
      return new Promise<User>((resolve, reject) => {
        const userData = savedUsers.find((u) => u.id === id);

        if (userData) {
          setUser(userData);

          return resolve(userData);
        }

        reject();
      });
    },
    [savedUsers]
  );

  useEffect(() => {
    new Promise<void>((resolve, reject) => {
      // Get saved user list
      const savedUsersData = localStorage.getItem("users");
      const savedUsers: Array<User> = savedUsersData
        ? JSON.parse(savedUsersData)
        : [];

      setSavedUsers(savedUsers);

      // Get last used user info from saved users
      const lastUsedUserId = Cookie.get("last-user-id");

      if (lastUsedUserId) {
        const lastUserData = savedUsers.find((u) => u.id === lastUsedUserId);

        if (lastUserData) {
          setUser(lastUserData);
        }
      }

      resolve();
    }).then(stopLoading);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        savedUsers,
        createNewUser,
        setUserById,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
