import { CommentList } from "@/components/commentList";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { Meta } from "@/components/meta";
import VrmViewer from "@/components/vrmViewer";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { DEFAULT_PARAM, KoeiroParam } from "@/features/constants/koeiroParam";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import {
  Message,
  Screenplay,
  textsToScreenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { M_PLUS_2, Montserrat } from "next/font/google";
import { useCallback, useContext, useEffect, useState } from "react";

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

const mockedComments = [
  {
    id: 1,
    text: "Hello, world! Hello, world! Hello, world! Hello, world!",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=1",
  },
  {
    id: 2,
    text: "This is a comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=2",
  },
  {
    id: 3,
    text: "Another comment",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=3",
  },
  {
    id: 4,
    text: "Yet another comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=4",
  },
  {
    id: 5,
    text: "And one more",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=5",
  },
  {
    id: 6,
    text: "Hello, world! Hello, world! Hello, world! Hello, world!",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=1",
  },
  {
    id: 7,
    text: "This is a comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=2",
  },
  {
    id: 8,
    text: "Another comment",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=3",
  },
  {
    id: 9,
    text: "Yet another comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=4",
  },
  {
    id: 10,
    text: "And one more",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=5",
  },
  {
    id: 11,
    text: "Hello, world! Hello, world! Hello, world! Hello, world!",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=1",
  },
  {
    id: 12,
    text: "This is a comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=2",
  },
  {
    id: 13,
    text: "Another comment",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=3",
  },
  {
    id: 14,
    text: "Yet another comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=4",
  },
  {
    id: 15,
    text: "And one more",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=5",
  },
  {
    id: 16,
    text: "Hello, world! Hello, world! Hello, world! Hello, world!",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=1",
  },
  {
    id: 17,
    text: "This is a comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=2",
  },
  {
    id: 18,
    text: "Another comment",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=3",
  },
  {
    id: 19,
    text: "Yet another comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=4",
  },
  {
    id: 20,
    text: "And one more",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=5",
  },
  {
    id: 21,
    text: "Hello, world! Hello, world! Hello, world! Hello, world!",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=1",
  },
  {
    id: 22,
    text: "This is a comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=2",
  },
  {
    id: 23,
    text: "Another comment",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=3",
  },
  {
    id: 24,
    text: "Yet another comment",
    author: "Jane Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=4",
  },
  {
    id: 25,
    text: "And one more",
    author: "John Doe",
    profileImageUrl: "https://i.pravatar.cc/300?img=5",
  }
];


export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt);
      setKoeiroParam(params.koeiroParam);
      setChatLog(params.chatLog);
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

  /**
   * アシスタントとの会話を行う
   */
  const handleSendChat = useCallback(
    async (text: string) => {
      if (!openAiKey) {
        setAssistantMessage("APIキーが入力されていません");
        return;
      }

      const newMessage = text;

      if (newMessage == null) return;

      setChatProcessing(true);
      // ユーザーの発言を追加して表示
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      // Chat GPTへ
      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ];

      const stream = await getChatResponseStream(messages, openAiKey).catch(
        (e) => {
          console.error(e);
          return null;
        }
      );
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          // 返答内容のタグ部分の検出
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          // 返答を一文単位で切り出して処理する
          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n]|.{10,}[、,])/
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            // 発話不要/不可能な文字列だった場合はスキップ
            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            aiTextLog += aiText;

            // 文ごとに音声を生成 & 再生、返答を表示
            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], () => {
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
      }

      // アシスタントの返答をログに追加
      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, openAiKey, koeiroParam]
  );

  return (
    <div className={`${m_plus_2.variable} ${montserrat.variable}`}>
      <Meta />
      <Introduction openAiKey={openAiKey} onChangeAiKey={setOpenAiKey} />
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
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
      <CommentList comments={mockedComments} />
    </div>
  );
}
