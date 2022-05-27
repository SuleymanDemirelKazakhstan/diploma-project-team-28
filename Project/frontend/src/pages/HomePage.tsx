import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Center,
  CloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react";

import HumanImage1 from "../assets/human-1.png";
import HumanImage2 from "../assets/human-2.png";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../api/api.service";

enum HomePageStep {
  create,
  join,
}

const HomePage = () => {
  const [step, setStep] = useState(HomePageStep.join);

  return (
    <Box flex="1" position="relative" backgroundColor="#161d31">
      <Image src={HumanImage2} position="absolute" top="10%" left="1%" />
      <Image src={HumanImage1} position="absolute" bottom="0" right="8%" />

      <Center height="100%" position="relative" zIndex="2">
        {step === HomePageStep.join && (
          <RoomJoinComponent
            onCreateRoomClick={() => setStep(HomePageStep.create)}
          />
        )}

        {step === HomePageStep.create && (
          <RoomCreateComponent
            onReturnClick={() => setStep(HomePageStep.join)}
          />
        )}
      </Center>
    </Box>
  );
};

const RoomCreateComponent: React.FC<{ onReturnClick: () => any }> = (props) => {
  const navigate = useNavigate();

  const roomId = useMemo(() => "" + Date.now(), []);
  const [title, setTitle] = useState("");

  const onCreateRoom: React.FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();

      await ApiService.CreateRoom({
        id: roomId,
        title: title,
      });

      navigate(`/r/${roomId}`);
    },
    [title, roomId]
  );

  return (
    <Box
      backgroundColor="#283045"
      borderRadius="xl"
      width="450px"
      as="form"
      onSubmit={onCreateRoom}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        padding="24px"
        borderBottom="1px solid #3B4253"
      >
        <Heading color="white" fontWeight="500" fontSize="18px">
          Создать комнату
        </Heading>

        <CloseButton
          color="white"
          variant="ghost"
          onClick={props.onReturnClick}
        />
      </Flex>

      <Stack spacing="12px" padding="16px 24px">
        <FormControl>
          <FormLabel htmlFor="title" color="white" fontSize="12px">
            Название комнаты
          </FormLabel>
          <Input
            id="title"
            color="white"
            placeholder="Введите название комнаты"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="identifier" color="white" fontSize="12px">
            Идентификатор
          </FormLabel>
          <Input id="identifier" color="white" readOnly value={roomId} />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="link" color="white" fontSize="12px">
            Ссылка
          </FormLabel>
          <Input
            id="link"
            color="white"
            readOnly
            value={"https://chatroom.com/r/" + roomId}
          />
          <Text color="#7367F0" fontSize="12px" marginTop="6px" width="240px">
            Скопируйте ссылку и отправьте друзьям, чтобы пригласить
          </Text>
        </FormControl>
      </Stack>

      <Center padding="24px" borderTop="1px solid #3B4253">
        <Button colorScheme="purple" type="submit">
          Создать
        </Button>
      </Center>
    </Box>
  );
};

const RoomJoinComponent: React.FC<{ onCreateRoomClick: () => any }> = (
  props
) => {
  return (
    <Box backgroundColor="#283045" borderRadius="xl" width="450px">
      <Center padding="24px" borderBottom="1px solid #3B4253">
        <Heading color="white" fontWeight="500" fontSize="18px">
          Привет!
        </Heading>
      </Center>

      <Stack spacing="16px" padding="16px 24px">
        <Text textAlign="center" color="white" fontSize="14px">
          Чтобы оказаться в пространстве, вставь ссылку комнаты, которой
          поделился твой друг или создай свою комнату и приглашай людей в неё :)
        </Text>

        <Stack direction="row">
          <Input color="white" flex="1" />
          <Button colorScheme="purple" variant="outline">
            Присоединиться по ID
          </Button>
        </Stack>
      </Stack>

      <Center padding="24px" borderTop="1px solid #3B4253">
        <Button colorScheme="purple" onClick={props.onCreateRoomClick}>
          Создать комнату
        </Button>
      </Center>
    </Box>
  );
};

export default HomePage;
