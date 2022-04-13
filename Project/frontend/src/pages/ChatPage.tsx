import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box, Center, Flex, Heading } from "@chakra-ui/react";
import { io, Socket } from "socket.io-client";
import Peer from "simple-peer";
import debounce from "lodash/debounce";

import { UserContext } from "../context/UserContext";
import RoomFormModal from "../components/RoomFormModal";
import {
  CreateRoomInput,
  FriendRoomJoinMsg,
  FriendUpdateMsg,
  JoinRoomInput,
  JoinRoomMsg,
  ProfileCreateMsg,
  Room,
  User,
} from "../types";

const ChatPage = () => {
  const { user } = useContext(UserContext);

  const socketRef = useRef<Socket>();
  const [me, setMe] = useState<User>();
  const myPeerRef = useRef<Peer.Instance>();
  const [joinedRoom, setJoinedRoom] = useState<Room>();
  const [joinedRoomMembers, setJoinedRoomMembers] = useState<User[]>([]);
  const dragZoneRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  const peerRef = useRef<Peer.Instance>();
  const myStreamRef = useRef<MediaStream>();

  const createRoom = useCallback(
    (input: CreateRoomInput) => {
      socketRef.current?.emit("room:create", input);
    },
    [socketRef]
  );

  const joinRoom = useCallback(
    (input: JoinRoomInput) => {
      socketRef.current?.emit("room:join", input);
    },
    [socketRef]
  );

  const onProfileCreate = useCallback(
    (data: ProfileCreateMsg) => {
      setMe({
        ...user,
        ...data,
      } as User);

      console.log("Created my profile", {
        ...user,
        ...data,
      });
    },
    [user]
  );

  const sendMove = useCallback(
    debounce(({ x, y }: { x: number; y: number }) => {
      socketRef.current?.emit("me:move", { x, y });
    }, 50),
    [socketRef]
  );

  const onJoinRoom = useCallback(
    (data: JoinRoomMsg) => {
      console.log("me:room:join", data);

      setJoinedRoom({
        id: data.id,
        name: data.name,
        adminUser: data.adminUser,
      });
      setJoinedRoomMembers(data.members);

      myPeerRef.current = new Peer({
        initiator: true,
        stream: myStreamRef.current,
        trickle: false,
      });
    },
    [me]
  );

  const onFriendRoomJoin = useCallback((data: FriendRoomJoinMsg) => {
    setJoinedRoomMembers((prev) => [...prev, data as User]);
  }, []);

  const onFriendUpdate = useCallback((data: FriendUpdateMsg) => {
    console.log("on:friend:update", data);

    setJoinedRoomMembers((prev) => {
      return [
        ...prev.filter((memberItem) => memberItem.id !== data.id),
        data as User,
      ];
    });
  }, []);

  const move = useCallback((ev: MouseEvent) => {
    const x = Math.abs(dragZoneRef.current.clientLeft - ev.clientX);
    const y = Math.abs(dragZoneRef.current.offsetTop - ev.clientY);

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

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.REACT_APP_IO_URL!, {
        query: user,
      });

      socketRef.current.on("me:profile:create", onProfileCreate);

      socketRef.current.on("me:room:join", onJoinRoom);

      socketRef.current.on("friend:room:join", onFriendRoomJoin);

      socketRef.current.on("friend:update", onFriendUpdate);
    }

    if (!myStreamRef.current) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          myStreamRef.current = stream;
        });
    }
  }, []);

  return (
    <Flex flex="1" flexDirection="column" backgroundColor="#161D31">
      {joinedRoom ? (
        <Box
          flex="1"
          position="relative"
          ref={dragZoneRef}
          // onMouseUp={onDragEnd}
        >
          {me && (
            <Box
              border="1px solid white"
              position="absolute"
              top={`${me.y}px`}
              left={`${me.x}px`}
              onMouseDown={onDragStart}
              onMouseUp={onDragEnd}
            >
              <video id={`video-${me.id}`}></video>
            </Box>
          )}

          {joinedRoomMembers
            .filter((memberItem) => memberItem.id !== me?.id)
            .map((memberItem) => (
              <Box
                key={memberItem.id}
                position="absolute"
                top={`${memberItem.y}px`}
                left={`${memberItem.x}px`}
              >
                <video id={`video-${memberItem.id}`}></video>
              </Box>
            ))}
        </Box>
      ) : (
        <Center flex="1">
          <RoomFormModal onJoinRoom={joinRoom} onCreateRoom={createRoom} />
        </Center>
      )}
    </Flex>
  );
};

export default ChatPage;
