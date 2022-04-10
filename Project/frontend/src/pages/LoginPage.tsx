import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const LoginPage = () => {
  const userContext = useContext(UserContext);

  const [step, setStep] = useState<"user-info" | "room-selector">("user-info");

  const onLogin = useCallback(
    (name) => {
      userContext.setUserInfo({
        name: name,
      });

      setStep("room-selector");
    },
    [userContext]
  );

  return (
    <Center
      flex="1"
      backgroundColor="#161D31"
      alignItems="center"
      justifyContent="center"
    >
      {step === "user-info" && <UserInfo onSubmit={onLogin} />}
      {step === "room-selector" && <RoomSelector />}
    </Center>
  );
};

const UserInfo: React.FC<{ onSubmit: (name: string) => any }> = ({
  onSubmit,
}) => {
  const [name, setName] = useState<string>("");

  return (
    <Box
      as="form"
      borderRadius="8px"
      backgroundColor="#283046"
      color="white"
      width="510px"
      onSubmit={() => onSubmit(name)}
    >
      <Stack borderBottom="2px solid #3B4253" padding="24px" spacing="16px">
        <FormControl>
          <FormLabel htmlFor="name" fontSize="14px">
            Как к Вам обращаться?
          </FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="name"
            placeholder="Введите имя"
          />
        </FormControl>
      </Stack>

      <Center height="65px">
        <Button type="submit" backgroundColor="#7367F0" paddingX="36px">
          Войти
        </Button>
      </Center>
    </Box>
  );
};

const RoomSelector = () => {
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
          Чтобы оказаться в пространстве, <br /> вставь ссылку комнаты, которой
          поделился <br /> твой друг или создай свою комнату <br /> и приглашай
          людей в неё :)
        </Text>

        <Button backgroundColor="#7367F0" paddingX="24px">
          Присоединиться по ID
        </Button>
      </Stack>

      <Center height="53px">
        <Button variant="link">Создать комнату</Button>
      </Center>
    </Box>
  );
};

export default LoginPage;
