import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const tuberModel = () =>
  new ChatOpenAI({
    modelName: "gpt-4-0613",
    temperature: 0,
  });

export const toolModel = () =>
  new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0613",
    temperature: 0,
  });

export const embeddings = () => {
  return new OpenAIEmbeddings();
};
