import { ChatOpenAI } from "langchain/chat_models/openai";
import { BaseChatMessage } from "langchain/schema";
import { AITuberMemory } from "./memory";
import { chatPrompt } from "./prompt";

export const executeAITuber = async (
  model: ChatOpenAI,
  messages: BaseChatMessage[],
  summarize: string
) => {
  const memory = new AITuberMemory({
    llm: model,
    returnMessages: true,
    summarize,
  });

  const prompt = await chatPrompt.formatPromptValue({
    history: memory.loadMemoryVariables({}).then((v) => v.history),
    new_lines: messages,
  });

  const response = await model.predictMessages(prompt.toChatMessages());
  await memory.saveContext(
    { messages: prompt.toChatMessages() },
    { input: response }
  );

  return {
    text: response.text,
    summarize: await memory
      .loadMemoryVariables({})
      .then((v) => v["history"][0].text),
  };
};
