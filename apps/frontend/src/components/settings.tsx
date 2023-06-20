import {
  KoeiroParam
} from "@/features/constants/koeiroParam";
import { Message } from "@/features/messages/messages";
import React from "react";
import { IconButton } from "./iconButton";

type Props = {
  chatName: string;
  systemPrompt: string;
  chatLog: Message[];
  koeiroParam: KoeiroParam;
  onClickClose: () => void;
  onChangeChatName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
};
export const Settings = ({
  chatName,
  chatLog,
  systemPrompt,
  koeiroParam,
  onClickClose,
  onChangeSystemPrompt,
  onChangeChatName,
  onChangeChatLog,
  onChangeKoeiroParam,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
}: Props) => {
  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64 ">
          <div className="my-24 typography-32 font-bold">設定</div>
          <div className="my-24">
            <div className="my-16 typography-20 font-bold">チャットネーム</div>
            <input
              className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
              type="text"
              placeholder="sk-..."
              value={chatName}
              onChange={onChangeChatName}
            />
            <div>
              チャットネームはコメント欄で使用されます。
            </div>
          </div>



        </div>
      </div>
    </div>
  );
};
