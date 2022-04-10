import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box, Heading } from "@chakra-ui/react";
import { io, Socket } from "socket.io-client";

import debounce from "lodash/debounce";

import { UserContext } from "../context/UserContext";
import { useParams } from "react-router-dom";

interface User {
  id: string;
  name: string;
  x: number;
  y: number;
}

const ChatRoom = () => {
  const { roomId } = useParams();

  const userContext = useContext(UserContext);
  const socketRef = useRef<Socket>();
  const roomRef = useRef<any>();
  const [me, setMe] = useState<User>();
  const [friends, setFriends] = useState<User[]>([]);
  const dragZoneRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  const sendMove = useCallback(
    debounce(({ x, y }: { x: number; y: number }) => {
      socketRef.current?.emit("me:move", { x, y });
    }, 50),
    [socketRef]
  );

  const move = useCallback((ev: MouseEvent) => {
    const x = Math.abs(dragZoneRef.current.clientLeft - ev.clientX);
    const y = Math.abs(dragZoneRef.current.offsetTop - ev.clientY);

    console.log("move", x, y);

    if (x > 1 && y > 1) {
      setMe(
        (prev) =>
          ({
            ...prev,
            x: x,
            y: y,
          } as User)
      );

      sendMove({ x, y });
    }
  }, []);

  const onDragStart: React.MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      console.log("start");
      window.addEventListener("mousemove", move);
    }, []);

  const onDragEnd: React.MouseEventHandler<HTMLDivElement> = useCallback(() => {
    console.log("end");
    window.removeEventListener("mousemove", move);
  }, []);

  const updateMyInfo = useCallback(
    (info) => {
      setMe(info);
    },
    [setMe]
  );

  const addFriend = useCallback(
    (friendData) => {
      console.log("add friend", friendData);
      setFriends((prev) => [...prev, friendData]);
    },
    [setFriends]
  );

  const updateFriend = useCallback(
    (friendData) => {
      console.log("update friend", friendData);
      setFriends((prev) => {
        return [
          ...prev.filter((friend) => friend.id !== friendData.id),
          friendData,
        ];
      });
    },
    [setFriends]
  );

  useEffect(() => {
    if (userContext.user) {
      const isAdmin = window.location.search.indexOf("admin") > -1;

      socketRef.current = io("ws://localhost:4000", {
        query: {
          userName: userContext.user?.name,
        },
      });

      socketRef.current.on("me", (data) => {
        updateMyInfo(data);
      });

      socketRef.current.on("me:room:join", (data) => {
        roomRef.current = data;
        console.log("roomId", data.roomId);
      });

      socketRef.current.on("friend:room:join", (data) => {
        addFriend(data);
      });

      socketRef.current.on("friend:update", (data) => {
        updateFriend(data);
      });

      if (isAdmin) {
        socketRef.current.emit("room:create", { roomName: "Kaisar room" });
      }
    }
  }, [userContext, addFriend, updateFriend, updateMyInfo]);

  return (
    <Box
      flex="1"
      backgroundColor="#161D31"
      position="relative"
      ref={dragZoneRef}
      onMouseUp={onDragEnd}
    >
      {me && (
        <Box
          position="absolute"
          top={`${me.y}px`}
          left={`${me.x}px`}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
        >
          <Heading color="white">{me.name}</Heading>
        </Box>
      )}

      {friends.map((friendItem) => (
        <ChatUser
          key={friendItem.name}
          name={friendItem.name}
          x={friendItem.x}
          y={friendItem.y}
        />
      ))}
    </Box>
  );
};

const ChatUser: React.FC<{
  name: string;
  x: number;
  y: number;
}> = (props) => {
  return (
    <Box position="absolute" top={`${props.y}px`} left={`${props.x}px`}>
      <Heading color="white">{props.name}</Heading>
    </Box>
  );
};

export default ChatRoom;
