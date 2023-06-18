import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptValue } from "langchain/dist/prompts/chat";
import { Embeddings } from "langchain/embeddings/base";
import {
  AIChatMessage,
  BaseChatMessage,
  FunctionChatMessage,
} from "langchain/schema";
import { TokenTextSplitter } from "langchain/text_splitter";
import { ChatCompletionRequestMessageFunctionCall } from "openai";
import { AITuberMemory } from "./memory";
import { chatPrompt } from "./prompt";
import { StructuredGoogleTool } from "./tools/google-search";
import { WebBrowser } from "./tools/web-browser";

export interface ExecuteAITuberOptions {
  model: ChatOpenAI;
  modelForTools?: ChatOpenAI;
  embeddings: Embeddings;
  messages: BaseChatMessage[];
  summarize: string;
  onMessage?: (message: string) => void;
}

export const executeAITuber = async (options: ExecuteAITuberOptions) => {
  const { model, modelForTools, messages, summarize, onMessage } = options;

  const tools = [
    new StructuredGoogleTool(),
    new WebBrowser(modelForTools || model, options.embeddings),
  ];
  const memory = new AITuberMemory({
    llm: model,
    returnMessages: true,
    summarize,
  });

  let agentScratchpad: BaseChatMessage[] = [];
  let prompt: ChatPromptValue;
  let response: BaseChatMessage;
  let responseMessages: string[] = [];

  while (true) {
    try {
      prompt = await chatPrompt.formatPromptValue({
        history: memory.loadMemoryVariables({}).then((v) => v.history),
        new_lines: messages,
        agent_scratchpad: agentScratchpad,
      });

      response = await model.predictMessages(prompt.toChatMessages(), {
        tools,
      });

      if (response.text) {
        onMessage && onMessage(response.text);
        responseMessages.push(response.text);
      }
      if (!response.additional_kwargs.function_call) break;

      const function_call: ChatCompletionRequestMessageFunctionCall =
        response.additional_kwargs.function_call;

      const toolNames = function_call.name || "";
      const tool = tools.find((t) => t.name === toolNames);
      if (!tool) continue;
      const observation = await tool?.call(
        JSON.parse(function_call.arguments || "{}")
      );

      const splitter = new TokenTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
      });
      const tokens = await splitter.splitText(observation);

      agentScratchpad = [
        ...agentScratchpad,
        new AIChatMessage("", { function_call }),
        new FunctionChatMessage(tokens[0], toolNames),
      ];
    } catch (e) {
      console.error(e.toJSON ? e.toJSON() : e);
      continue;
    }
  }
  await memory.saveContext(
    { messages: prompt.toChatMessages() },
    { input: response }
  );

  return {
    texts: responseMessages,
    summarize: await memory
      .loadMemoryVariables({})
      .then((v) => v["history"][0].text as string),
  };
};
