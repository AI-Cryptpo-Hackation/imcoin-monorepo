import { useCallback, useState } from "react";

type Props = {
  chatName: string;
  onChangeChatName: (name: string) => void;
};
export const Introduction = ({ chatName, onChangeChatName }: Props) => {
  const [opened, setOpened] = useState(true);

  const handleChatNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeChatName(event.target.value);
    },
    [onChangeChatName]
  );

  return opened ? (
    <div className="absolute z-40 w-full h-full px-24 py-40  bg-black/30 font-M_PLUS_2">
      <div className="mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary ">
            このアプリケーションについて
          </div>
          <div>
            Webブラウザだけで3Dキャラクターとの会話を、マイクやテキスト入力、音声合成を用いて楽しめます。キャラクター（VRM）の変更や性格設定、音声調整もできます。
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            利用上の注意
          </div>
          <div>
            差別的または暴力的な発言、特定の人物を貶めるような発言を、意図的に誘導しないでください。また、VRMモデルを使ってキャラクターを差し替える際はモデルの利用条件に従ってください。
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            チャットで使う名前
          </div>
          <input
            type="text"
            placeholder="木村拓哉"
            value={chatName}
            onChange={handleChatNameChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
          ></input>
        </div>
        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
          >
            チャットネームを入力してはじめる
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
