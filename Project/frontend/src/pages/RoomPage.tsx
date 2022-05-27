import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { UserContext } from "../context/UserContext";
import Peer from "simple-peer";

const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useContext(UserContext);

  const [userPos, setUserPos] = useState({ x: 0, y: 0 });
  const userVideoRef = useRef<HTMLVideoElement>(null!);

  const [roomData, setRoomData] = useState<any>({});
  const [peers, setPeers] = useState<any[]>([]);
  const socketRef = useRef<Socket>(null!);
  const friendsRef = useRef<any[]>([]);

  useEffect(() => {
    socketRef.current = io("/");

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 100,
          height: 100,
        },
        audio: true,
      })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;

        // Join room
        socketRef.current.emit("me:room:join", {
          roomId: roomId,
          user: { ...user, ...userPos },
        });

        // When joined room data recieved
        socketRef.current.on("room:data", (data) => {
          setRoomData(data);

          console.log(socketRef.current.id, data);

          // Call all friends in this room
          data.users
            .filter((u: any) => u.socketId !== socketRef.current.id) // except myself
            .forEach((userItem: any) => {
              const peer = new Peer({
                initiator: true,
                trickle: false,
                stream,
              });

              peer.on("signal", (signal) => {
                socketRef.current.emit("me:signal:send", {
                  userToSignal: userItem.socketId,
                  callerId: socketRef.current.id,
                  signal,
                });
              });

              friendsRef.current.push({
                ...userItem,
                peer,
              });

              setPeers((prev) => [...prev, peer]);
            });
        });

        // When friend calls me
        socketRef.current.on("friend:signal:send", (data) => {
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
          });

          peer.on("signal", (signal) => {
            socketRef.current.emit("me:signal:return", {
              signal,
              callerID: data.callerID,
            });
          });

          peer.signal(data.signal);

          friendsRef.current.push({
            peerID: data.callerID,
            peer,
          });

          setPeers((prev) => [...prev, peer]);
        });

        socketRef.current.on("friend:signal:return", (payload) => {
          const item = friendsRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, []);

  return (
    <Box flex="1" backgroundColor="#161d31">
      <video ref={userVideoRef} autoPlay playsInline muted />

      {peers.map((peerItem, idx) => (
        <Video key={idx} peer={peerItem} />
      ))}
    </Box>
  );
};

const Video: React.FC<{ peer: Peer.Instance }> = (props) => {
  const ref = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <video playsInline autoPlay ref={ref} />;
};

export default RoomPage;
