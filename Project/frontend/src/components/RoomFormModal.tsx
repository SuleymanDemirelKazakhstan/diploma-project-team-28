import React, { useState } from "react";
import { Box, Button, Center, Input, Stack, Text } from "@chakra-ui/react";
import { CreateRoomInput, JoinRoomInput } from "../types";

interface RoomFormModalProps {
  onJoinRoom: (input: JoinRoomInput) => void;
  onCreateRoom: (input: CreateRoomInput) => void;
}

const RoomFormModal: React.FC<RoomFormModalProps> = (props) => {
  const [roomName, setRoomName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  return (
    <Box
      borderRadius="8px"
      backgroundColor="#283046"
      color="white"
      width="400px"
    >
      <Center height="48px">
        <Text fontSize="20">Привет!</Text>
      </Center>

      <Stack
        borderTop="2px solid #3B4253"
        borderBottom="2px solid #3B4253"
        paddingY="16px"
        paddingX="36px"
        spacing="28px"
      >
        <Text
          fontSize="14px"
          textAlign="center"
          lineHeight="21px"
          color="#B4B7BD"
        >
          Чтобы оказаться в пространстве, <br /> вставь id комнаты, которой
          поделился <br /> твой друг или создай свою комнату <br /> и приглашай
          людей в неё :)
        </Text>

        <Stack direction="row" spacing="16px">
          <Input
            placeholder="Id комнаты"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <Button
            backgroundColor="#7367F0"
            onClick={() => props.onJoinRoom({ roomId })}
          >
            Войти
          </Button>
        </Stack>

        <Stack direction="row" spacing="16px">
          <Input
            placeholder="Название комнаты"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Button
            backgroundColor="#7367F0"
            onClick={() => props.onCreateRoom({ roomName })}
          >
            Создать
          </Button>
        </Stack>
      </Stack>

      <Center height="53px">
        <Button variant="link">Создать комнату</Button>
      </Center>
    </Box>
  );
};

export default RoomFormModal;
