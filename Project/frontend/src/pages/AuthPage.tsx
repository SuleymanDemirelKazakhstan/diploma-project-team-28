import {
  Avatar,
  Box,
  Button,
  Center,
  Checkbox,
  CloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  Stack,
  Text,
  VisuallyHiddenInput,
} from "@chakra-ui/react";
import React, {
  ChangeEventHandler,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { User } from "../types";

enum AuthPageStep {
  Pick,
  Create,
}

interface CreateUserData {
  name: string;
  avatar: File | null;
  remember: boolean;
}

const AuthPage = () => {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  const [step, setStep] = useState(AuthPageStep.Pick);

  const onCreateProfile = useCallback((userData: CreateUserData) => {
    // TODO: upload avatar
    return userContext
      .createNewUser(
        {
          name: userData.name,
          avatar: "userData.avatar",
        },
        userData.remember
      )
      .then(() => {
        navigate("/");
      });
  }, []);

  const onSelectUser = useCallback((id: string) => {
    userContext.setUserById(id).then(() => navigate("/"));
  }, []);

  return (
    <Center flex="1" backgroundColor="#161d31">
      {step === AuthPageStep.Pick && (
        <ProfilePicker
          users={userContext.savedUsers}
          onSelectUser={onSelectUser}
          onCreateNewUserClick={() => setStep(AuthPageStep.Create)}
        />
      )}
      {step === AuthPageStep.Create && (
        <ProfileCreator onSubmit={onCreateProfile} />
      )}
    </Center>
  );
};

const ProfilePicker: React.FC<{
  users: User[];
  onCreateNewUserClick: Function;
  onSelectUser: (id: string) => any;
}> = (props) => {
  return (
    <Box
      backgroundColor="#283045"
      borderRadius="xl"
      width="450px"
      as="form"
      // onSubmit={onSubmitForm}
    >
      <Flex alignItems="center" justifyContent="space-between" padding="24px">
        <Heading color="white" fontWeight="500" fontSize="18px">
          Выбрать аккаунт
        </Heading>

        <CloseButton color="white" />
      </Flex>

      <Stack spacing="12px" paddingY="12px" paddingBottom="24px">
        {props.users.map((userItem) => (
          <Flex
            key={userItem.id}
            paddingX="24px"
            alignItems="center"
            color="#676D7D"
            _hover={{
              backgroundColor: "#31375A",
              color: "#7367F0",
            }}
            onClick={() => props.onSelectUser(userItem.id!)}
          >
            <Avatar name={userItem.name} size="md" src={userItem.avatar} />

            <Text marginLeft="12px">{userItem.name}</Text>

            <IconButton
              marginLeft="auto"
              colorScheme="red"
              variant="link"
              aria-label="delete"
              icon={<MdOutlineDeleteOutline fontSize="24px" />}
            />
          </Flex>
        ))}

        <Button
          variant="link"
          colorScheme="whatsapp"
          onClick={() => props.onCreateNewUserClick()}
        >
          Создать аккаунт
        </Button>
      </Stack>
    </Box>
  );
};

const ProfileCreator: React.FC<{
  onSubmit: (userData: CreateUserData) => any;
}> = (props) => {
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUploadImage: ChangeEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
      if (e.target.files?.length) {
        const file = e.target.files[0];
        setImage(file);

        const src = await fileToBase64(file);
        setImageSrc(src);
      }
    },
    []
  );

  const onSubmitForm: React.FormEventHandler = (e) => {
    e.preventDefault();

    props.onSubmit({
      name: name,
      remember: remember,
      avatar: image,
    });
  };

  return (
    <Box
      backgroundColor="#283045"
      borderRadius="xl"
      as="form"
      onSubmit={onSubmitForm}
    >
      <Box padding="24px">
        <FormControl>
          <FormLabel htmlFor="name" fontSize="12px" color="white">
            Как к Вам обращаться?
          </FormLabel>
          <Input
            id="name"
            placeholder="Введите имя"
            width="410px"
            color="white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        {imageSrc && (
          <Image
            src={imageSrc}
            objectFit="cover"
            boxSize="94px"
            marginTop="16px"
            borderRadius="2xl"
          />
        )}

        <Button
          marginTop="16px"
          variant="outline"
          colorScheme="yellow"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить фото
        </Button>
        <VisuallyHiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onUploadImage}
        />

        <FormControl display="flex" alignItems="center" marginTop="16px">
          <Checkbox
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <FormLabel
            htmlFor="remember"
            fontSize="14px"
            color="white"
            margin="0 0 0 8px"
          >
            Запомнить меня
          </FormLabel>
        </FormControl>
      </Box>
      <Center padding="12px" borderTop="1px solid #3B4253">
        <Button type="submit" colorScheme="purple" minWidth="140px">
          Войти
        </Button>
      </Center>
    </Box>
  );
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export default AuthPage;
