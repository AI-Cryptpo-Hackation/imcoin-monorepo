import { ChatOpenAI } from "langchain/chat_models/openai";

export const tuberModel = () =>
  new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0613",
    temperature: 0,
  });
