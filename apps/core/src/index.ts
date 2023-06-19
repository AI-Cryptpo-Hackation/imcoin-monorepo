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
import { polygonMumbai } from "viem/chains";
import { AITuberMemory } from "./memory";
import { chatPrompt } from "./prompt";
import { StructuredGoogleTool } from "./tools/google-search";
import { TokenTool } from "./tools/token-tool";
import {
  NonceManager,
  createNonceManager,
} from "./tools/token-tool/tx-manager";
import { WebBrowser } from "./tools/web-browser";

export interface ExecuteAITuberOptions {
  model: ChatOpenAI;
  modelForTools?: ChatOpenAI;
  embeddings: Embeddings;
  messages: BaseChatMessage[];
  summarize: string;
  onMessage?: (message: string) => void;
}

let nonceManager: NonceManager;

export const executeAITuber = async (options: ExecuteAITuberOptions) => {
  if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");
  if (!process.env.TOKEN_ADDRESS) throw new Error("TOKEN_ADDRESS not set");
  if (!process.env.WALLET_ADDRESS) throw new Error("WALLET_ADDRESS not set");

  const { model, modelForTools, messages, summarize, onMessage } = options;

  const chain = polygonMumbai;
  nonceManager ??= createNonceManager(chain, process.env.WALLET_ADDRESS);

  const tools = [
    new TokenTool({
      chain,
      nonceManager,
      privateKey: process.env.PRIVATE_KEY,
      contractAddress: process.env.TOKEN_ADDRESS,
    }),
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
      console.log("Liver use:", toolNames, function_call.arguments);
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
      console.error(e);
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
