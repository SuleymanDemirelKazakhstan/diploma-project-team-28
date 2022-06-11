import {
  Box,
  ChakraComponent,
  IconButton,
  Stack,
  StackProps,
} from "@chakra-ui/react";
import React, {
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MdOutlineCameraswitch } from "react-icons/md";
import { RiScreenshot2Fill } from "react-icons/ri";
import { useParams } from "react-router-dom";
import Peer from "simple-peer";
import io, { Socket } from "socket.io-client";
import { UserContext } from "../context/UserContext";

const videoConstraints = {
  width: 120,
  height: 120,
};

const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useContext(UserContext);

  const [userPos, setUserPos] = useState({ x: 0, y: 0 });
  const userVideoRef = useRef<HTMLVideoElement>(null!);
  const myStreamRef = useRef<MediaStream>(null!);

  const [roomData, setRoomData] = useState<any>({});
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const socketRef = useRef<Socket>(null!);
  const friendsRef = useRef<any[]>([]);

  useEffect(() => {
    (async () => {
      socketRef.current = io("/");

      myStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true,
      });

      userVideoRef.current.srcObject = myStreamRef.current;

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
              stream: myStreamRef.current,
            });

            peer.on("signal", (signal) => {
              socketRef.current.emit("me:signal:send", {
                userToSignal: userItem.socketId,
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
        /* 
            {
              signal: payload.signal,
              callerID: socket.id,
            }
          */
        const peer = new Peer({
          initiator: false,
          stream: myStreamRef.current,
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

      // When friend accepts my call
      socketRef.current.on("friend:signal:return", (payload) => {
        /* 
            {
              signal: payload.signal,
              id: socket.id,
            }
          */
        const item = friendsRef.current.find((u) => u.socketId === payload.id);
        item.peer.signal(payload.signal);
      });
    })();
  }, []);

  const onStartScreenShare = useCallback(async () => {
    const captureStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        ...videoConstraints,
      },
      audio: false,
    });

    const videoTrack = myStreamRef.current.getVideoTracks()[0];
    myStreamRef.current.removeTrack(videoTrack);
    myStreamRef.current.addTrack(captureStream.getVideoTracks()[0]);

    peers.forEach((peer) => peer.addStream(captureStream));
  }, [peers]);

  return (
    <Box flex="1" backgroundColor="#161d31" position="relative">
      <ControlPanel
        chakraProps={{
          position: "absolute",
          top: "50%",
          right: "50px",
          transform: "translateY(-50%)",
        }}
        onStartScreenShare={onStartScreenShare}
      />

      <Box
        width={videoConstraints.height}
        height={videoConstraints.width}
        borderRadius="50%"
        overflow="hidden"
        outline="5px solid #EF5525"
      >
        <video
          style={{ objectFit: "cover", transform: "rotateY(180deg)" }}
          ref={userVideoRef}
          autoPlay
          playsInline
          muted
        />
      </Box>

      {peers.map((peerItem, idx) => (
        <Member key={idx} peer={peerItem} />
      ))}
    </Box>
  );
};

const ControlPanel: React.FC<{
  onStartScreenShare: MouseEventHandler<HTMLButtonElement>;
  chakraProps: StackProps;
}> = (props) => {
  return (
    <Stack
      padding="12px"
      backgroundColor="purple.600"
      borderRadius="2xl"
      {...props.chakraProps}
    >
      <IconButton
        colorScheme="orange"
        aria-label="Switch camera"
        icon={<MdOutlineCameraswitch />}
      />

      <IconButton
        colorScheme="orange"
        aria-label="Screen share"
        icon={<RiScreenshot2Fill />}
        onClick={props.onStartScreenShare}
      />
    </Stack>
  );
};

const Member: React.FC<{ peer: Peer.Instance }> = (props) => {
  return (
    <Box width={videoConstraints.height} height={videoConstraints.width}>
      <Video peer={props.peer} />
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

  return (
    <video
      style={{ objectFit: "cover" }}
      ref={ref}
      playsInline
      autoPlay
      muted
    />
  );
};

export default RoomPage;
