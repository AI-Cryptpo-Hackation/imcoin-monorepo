import { CommentList } from "@/components/commentList";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { Meta } from "@/components/meta";
import VrmViewer from "@/components/vrmViewer";
import { DEFAULT_PARAM, KoeiroParam } from "@/features/constants/koeiroParam";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import {
  Message,
  Screenplay,
  textsToScreenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { ConnectButton, } from '@rainbow-me/rainbowkit';
import { M_PLUS_2, Montserrat } from "next/font/google";
import { useCallback, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useAccount, } from 'wagmi';

const CHAT_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_ENDPOINT || 'http://localhost:3001';

const m_plus_2 = M_PLUS_2({
  variable: "--font-m-plus-2",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  display: "swap",
  subsets: ["latin"],
});

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveChat, setLiveChat] = useState<Comment[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt);
      setKoeiroParam(params.koeiroParam);
      setChatLog(params.chatLog);
    }

    const _socket = io(CHAT_ENDPOINT);
    _socket.on('connection', () => {
      _socket.on('history', (message: Comment) => {
        setLiveChat(prev => [...prev, message]);
      }); 
    });

    _socket.on('comment', (message: Comment) => {
      setLiveChat(prev => [...prev, message]);
    });

    _socket.on("liver-update", (message: any) => {
      let {response: receivedMessage} = message;
      try {
        if (receivedMessage == null) {
          setChatProcessing(false);
          return;
        }
      
        let aiTextLog = "";
        let tag = "";
        const sentences = new Array<string>();
      
        // Detecting tag in the response content
        const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
        if (tagMatch && tagMatch[0]) {
          tag = tagMatch[0];
          receivedMessage = receivedMessage.slice(tag.length);
        }
      
        // Processing the response sentence by sentence
        const sentenceMatch = receivedMessage.match(
          /^(.+[。．！？\n]|.{10,}[、,])/
        );
        if (sentenceMatch && sentenceMatch[0]) {
          const sentence = sentenceMatch[0];
          sentences.push(sentence);
          receivedMessage = receivedMessage
            .slice(sentence.length)
            .trimStart();
      
          // Skip if the string was unpronounceable/unneeded for utterance
          const sentenceTrimmed = sentence.replace(
            /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
            ""
          );

          if (sentenceTrimmed.length === 0) {
            return;
          }
                
          const aiText = `${tag} ${sentence}`;
          const aiTalks = textsToScreenplay([aiText], koeiroParam);
          aiTextLog += aiText;
      
          // Generate & play voice and display response for each sentence
          const currentAssistantMessage = sentences.join(" ");
          handleSpeakAi(aiTalks[0], () => {
            setAssistantMessage(currentAssistantMessage);
          });
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      }
    });

    setSocket(_socket);

    return () => {
      // アンマウント時にソケットを切断
      _socket.disconnect();
    }
  }, []);

  useEffect(() => {
    process.nextTick(() =>
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, koeiroParam, chatLog })
      )
    );
  }, [systemPrompt, koeiroParam, chatLog]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog]
  );

  /**
   * 文ごとに音声を直列でリクエストしながら再生する
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      speakCharacter(screenplay, viewer, onStart, onEnd);
    },
    [viewer]
  );

  const handleSendChat2 = useCallback(
    async (text: string) => {
      setChatProcessing(true);


      socket?.emit("send-comment", {
        address,
        username: "test",
        text,
        createdAt: Date.now()
      });
      setChatProcessing(false);

      
    }, [systemPrompt, chatLog, handleSpeakAi, openAiKey, koeiroParam]);

  return (
    <div className={`${m_plus_2.variable} ${montserrat.variable}`}>
      <Meta />
      <Introduction openAiKey={openAiKey} onChangeAiKey={setOpenAiKey} />
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat2}
      />
      <Menu
        openAiKey={openAiKey}
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        koeiroParam={koeiroParam}
        assistantMessage={assistantMessage}
        onChangeAiKey={setOpenAiKey}
        onChangeSystemPrompt={setSystemPrompt}
        onChangeChatLog={handleChangeChatLog}
        onChangeKoeiromapParam={setKoeiroParam}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
      />
      {/* TODO: モックやめる */}
      <CommentList comments={liveChat} />
      <div className="absolute top-16 right-16">
        <ConnectButton/>
      </div>
    </div>
  );
}
