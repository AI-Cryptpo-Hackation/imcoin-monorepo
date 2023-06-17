import dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";
import { executeAITuber } from ".";

dotenv.config();

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-0613",
  temperature: 0,
});

let { text, summarize } = await executeAITuber(
  model,
  [
    new HumanChatMessage(
      "木村拓哉: 初めまして！私は木村拓哉です！最近ラーメンを食べました。"
    ),
    new HumanChatMessage(
      "木村拓哉: 東京にある次郎というラーメンです。とてもおいしかったですが、量が多すぎて食べきれませんでした。"
    ),
  ],
  ""
);

console.log(text);
console.log(summarize);

let { text: text2, summarize: summarize2 } = await executeAITuber(
  model,
  [
    new HumanChatMessage(
      "錦織圭: 次郎なんてバカが食う食べ物だよ。油だらけで体に悪い。"
    ),
  ],
  summarize
);

console.log(text2);
console.log(summarize2);

let { text: text3, summarize: summarize3 } = await executeAITuber(
  model,
  [
    new HumanChatMessage(
      "橋本環奈: 今来たんだけど、何の話してるの？ちな、ラーメンは大好きだよ"
    ),
  ],
  summarize2
);

console.log(text3);
console.log(summarize3);
