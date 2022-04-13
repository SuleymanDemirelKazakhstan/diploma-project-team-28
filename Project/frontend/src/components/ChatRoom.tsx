import { Box } from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect } from "react";
import { JoinRoomInput } from "../types";

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  return <Box flex="1">ChatRoom {props.roomId}</Box>;
};

export default ChatRoom;
