import { Avatar, Box, IconButton, Stack, StackProps } from "@chakra-ui/react";
import DailyIframe, { DailyCall, DailyParticipant } from "@daily-co/daily-js";
import interact from "interactjs";
import { debounce } from "lodash";
import React, {
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";
import {
  RiCameraFill,
  RiCameraOffFill,
  RiMicFill,
  RiMicOffFill,
} from "react-icons/ri";
import reactable from "reactablejs";
import { UserContext } from "../context/UserContext";

enum CallEvent {
  PARTICIPANT_JOINED = "participant-joined",
  PARTICIPANT_UPDATED = "participant-updated",
  PARTICIPANT_LEFT = "participant-left",
  PARTICIPANT_USER_INFO_UPDATED = "app-message",
}

interface UserInfo {
  name: string;
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  avatar?: string;
}

type ParticipantWithUserInfo = DailyParticipant & { user_name: UserInfo };

const getPythagoreanDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const deltaX = Math.abs(x1 - x2);
  const deltaY = Math.abs(y1 - y2);

  const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

  return distance;
};

const getAudioVolumeByDistance = (distance: number) => {
  const max = 600;

  if (distance > max) {
    return 0;
  }

  return 1 - distance / max;
};

const RoomPage = () => {
  const userContext = useContext(UserContext);

  const callObjectRef = useRef<DailyCall>();
  const [members, setMembers] = useState<Array<ParticipantWithUserInfo>>();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: userContext.user!.name,
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0,
  });

  const startJoiningCall = useCallback(
    (url) => {
      const newCallObject = DailyIframe.createCallObject();
      newCallObject.join({
        url,
        userName: JSON.stringify(userInfo),
      });
      return newCallObject;
    },
    [userInfo]
  );

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    callObjectRef.current = startJoiningCall(params.roomUrl);

    function handleNewParticipantsState(event?: any) {
      const participants = Object.values(
        callObjectRef.current!.participants()
      ).map((participant) => ({
        ...participant,
        user_name: JSON.parse(participant.user_name),
      }));

      console.log("EVENT MEMBERS", participants);
      setMembers(participants);
    }

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in call state
    callObjectRef.current.on(
      CallEvent.PARTICIPANT_JOINED,
      handleNewParticipantsState
    );
    callObjectRef.current.on(
      CallEvent.PARTICIPANT_LEFT,
      handleNewParticipantsState
    );
    callObjectRef.current.on(
      CallEvent.PARTICIPANT_UPDATED,
      handleNewParticipantsState
    );
    callObjectRef.current.on("app-message", () => {
      console.log("CallEvent.PARTICIPANT_UPDATED");
      handleNewParticipantsState();
    });

    // callObjectRef
    //   .current!.enumerateDevices()
    //   .then((res) => console.log("INPUT DEVICES", res));

    return () => {
      callObjectRef.current!.leave();
    };
  }, []);

  useEffect(() => {
    console.log("MOVE", userInfo);
    callObjectRef.current?.setUserName(JSON.stringify(userInfo), {
      thisMeetingOnly: true,
    });
    callObjectRef.current?.sendAppMessage("hello", "*");
  }, [userInfo, callObjectRef]);

  const onMoveBubble = useCallback(
    (x, y) => {
      setUserInfo((prev) => ({
        ...prev,
        x: x,
        y: y,
      }));
    },
    [callObjectRef, setUserInfo]
  );
  const debouncedOnMoveBubble = debounce(onMoveBubble, 50);

  const onMoveScreen = useCallback(
    (x, y) => {
      setUserInfo((prev) => ({
        ...prev,
        screenX: x,
        screenY: y,
      }));
    },
    [callObjectRef, setUserInfo]
  );
  const debouncedOnMoveScreen = debounce(onMoveScreen, 50);

  return (
    <Box flex="1" backgroundColor="#161d31" position="relative">
      <ControlPanel
        chakraProps={{
          position: "fixed",
          top: "50%",
          right: "50px",
          transform: "translateY(-50%)",
        }}
        onStartScreenShare={() => callObjectRef.current?.startScreenShare()}
        onStopScreenShare={() => callObjectRef.current?.stopScreenShare()}
        onStartMic={() => callObjectRef.current?.setLocalAudio(true)}
        onStopMic={() => callObjectRef.current?.setLocalAudio(false)}
        onStartCamera={() => callObjectRef.current?.setLocalVideo(true)}
        onStopCamera={() => callObjectRef.current?.setLocalVideo(false)}
      />

      <InputSetup
        chakraProps={{
          position: "fixed",
          bottom: "50px",
          right: "50px",
        }}
      />

      {members &&
        members.map((memberItem) => {
          return (
            <Participant
              key={memberItem.user_id}
              participant={memberItem}
              audioVolume={getAudioVolumeByDistance(
                getPythagoreanDistance(
                  userInfo.x,
                  userInfo.y,
                  memberItem.user_name.x,
                  memberItem.user_name.y
                )
              )}
              onMoveBubble={debouncedOnMoveBubble}
              onMoveScreen={debouncedOnMoveScreen}
            />
          );
        })}
    </Box>
  );
};

const Participant: React.FC<{
  participant: ParticipantWithUserInfo;
  audioVolume?: number;
  onMoveBubble: (x: number, y: number) => void;
  onMoveScreen: (x: number, y: number) => void;
}> = (props) => {
  const isLocalUser = useMemo(
    () => props.participant.local,
    [props.participant]
  );

  function dragMoveListener(event: any, isScreen = false) {
    const target = event.target!;

    // keep the dragged position in the data-x/data-y attributes
    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    isScreen ? props.onMoveScreen(x, y) : props.onMoveBubble(x, y);

    // translate the element
    target.style.transform = "translate(" + x + "px, " + y + "px)";

    // update the posiion attributes
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  }

  if (isLocalUser) {
    return (
      <React.Fragment>
        <InteractiveBubble
          participant={props.participant}
          audioVolume={1}
          draggable={{
            modifiers: [
              interact.modifiers.restrictRect({
                restriction: "parent",
                endOnly: true,
              }),
            ],
            listeners: {
              // call this function on every dragmove event
              move: (e: DragEvent) => dragMoveListener(e),
            },
          }}
        />
        {props.participant.screen && (
          <InteractiveScreenBubble
            participant={props.participant}
            draggable={{
              modifiers: [
                interact.modifiers.restrictRect({
                  restriction: "parent",
                  endOnly: true,
                }),
              ],
              listeners: {
                // call this function on every dragmove event
                move: (e: DragEvent) => dragMoveListener(e, true),
              },
            }}
          />
        )}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Bubble
        participant={props.participant}
        audioVolume={props.audioVolume || 0}
      />
      {props.participant.screen && (
        <ScreenBubble participant={props.participant} />
      )}
    </React.Fragment>
  );
};

const Bubble: React.FC<{
  participant: ParticipantWithUserInfo;
  audioVolume: number;
  getRef?: any;
}> = (props) => {
  const videoEl = useRef<HTMLVideoElement>(null);
  const audioEl = useRef<HTMLAudioElement>(null);

  const isLocalUser = useMemo(() => {
    return props.participant.local;
  }, [props.participant]);

  const videoTrack = useMemo(() => {
    return props.participant.video && props.participant.tracks.video.track;
  }, [props.participant]);

  const audioTrack = useMemo(() => {
    return (
      props.participant.audio && props.participant.tracks.audio.persistentTrack
    );
  }, [props.participant]);

  useEffect(() => {
    if (!videoEl.current || !videoTrack) return;

    videoEl.current.srcObject = new MediaStream([videoTrack]);
  }, [videoTrack]);

  useEffect(() => {
    if (!audioEl.current || !audioTrack) return;

    audioEl.current.srcObject = new MediaStream([audioTrack]);
  }, [audioTrack]);

  useEffect(() => {
    if (!audioEl.current) return;

    console.log(props.participant?.user_name?.name, props.audioVolume);

    audioEl.current.volume = props.audioVolume;
  }, [props.audioVolume]);

  return videoTrack ? (
    <Box
      width="120px"
      height="120px"
      borderRadius="50%"
      overflow="hidden"
      border="5px solid #EF5525"
      position="absolute"
      transform={
        "translate(" +
        props.participant.user_name.x +
        "px, " +
        props.participant.user_name.y +
        "px)"
      }
      zIndex={isLocalUser ? 1000 : 0}
      ref={props.getRef}
    >
      <video
        autoPlay
        muted
        playsInline
        ref={videoEl}
        style={{
          objectFit: "cover",
          height: "120px",
          transform: isLocalUser ? "rotateY(180deg)" : "",
        }}
      />

      {!isLocalUser && audioTrack && (
        <audio autoPlay playsInline ref={audioEl} />
      )}
    </Box>
  ) : (
    <Avatar
      name={props.participant.user_name.name}
      size="lg"
      ref={props.getRef}
    />
  );
};

const ScreenBubble: React.FC<{
  participant: ParticipantWithUserInfo;
  getRef?: any;
}> = (props) => {
  const videoEl = useRef<HTMLVideoElement>(null);

  const isLocalUser = useMemo(() => {
    return props.participant.local;
  }, [props.participant]);

  const videoTrack = useMemo(() => {
    return (
      props.participant.screen && props.participant.tracks.screenVideo.track
    );
  }, [props.participant]);

  useEffect(() => {
    if (!videoEl.current || !videoTrack) return;

    videoEl.current.srcObject = new MediaStream([videoTrack]);
  }, [videoTrack]);

  return (
    <Box
      height="300px"
      overflow="hidden"
      border="5px solid #EF5525"
      position="absolute"
      transform={
        "translate(" +
        props.participant.user_name.screenX +
        "px, " +
        props.participant.user_name.screenY +
        "px)"
      }
      ref={props.getRef}
    >
      {videoTrack && (
        <video
          autoPlay
          muted
          playsInline
          ref={videoEl}
          style={{
            objectFit: "cover",
            height: "300px",
          }}
        />
      )}
    </Box>
  );
};

// For element move
const InteractiveBubble = reactable(Bubble);
const InteractiveScreenBubble = reactable(ScreenBubble);

const ControlPanel: React.FC<{
  chakraProps: StackProps;
  onStartScreenShare: MouseEventHandler<HTMLButtonElement>;
  onStopScreenShare: MouseEventHandler<HTMLButtonElement>;
  onStartMic: MouseEventHandler<HTMLButtonElement>;
  onStopMic: MouseEventHandler<HTMLButtonElement>;
  onStartCamera: MouseEventHandler<HTMLButtonElement>;
  onStopCamera: MouseEventHandler<HTMLButtonElement>;
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
        icon={<MdScreenShare />}
        onClick={props.onStartScreenShare}
      />

      <IconButton
        colorScheme="orange"
        aria-label="Screen share"
        icon={<MdStopScreenShare />}
        onClick={props.onStopScreenShare}
      />

      <IconButton
        colorScheme="orange"
        aria-label="Switch camera"
        icon={<RiCameraFill />}
        onClick={props.onStartCamera}
      />

      <IconButton
        colorScheme="orange"
        aria-label="Screen share"
        icon={<RiCameraOffFill />}
        onClick={props.onStopCamera}
      />

      <IconButton
        colorScheme="orange"
        aria-label="Switch camera"
        icon={<RiMicFill />}
        onClick={props.onStartMic}
      />

      <IconButton
        colorScheme="orange"
        aria-label="Screen share"
        icon={<RiMicOffFill />}
        onClick={props.onStopMic}
      />
    </Stack>
  );
};

const InputSetup: React.FC<{
  chakraProps: StackProps;
}> = (props) => {
  return <Stack {...props.chakraProps}></Stack>;
};

export default RoomPage;
