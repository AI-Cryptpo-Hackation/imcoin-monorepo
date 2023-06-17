import { BaseLanguageModel } from "langchain/base_language";
import { LLMChain } from "langchain/chains";
import {
  BaseChatMemory,
  BaseChatMemoryInput,
  getBufferString,
  getInputValue,
} from "langchain/memory";
import { BasePromptTemplate, PromptTemplate } from "langchain/prompts";
import { BaseChatMessage, SystemChatMessage } from "langchain/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputValues = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OutputValues = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MemoryVariables = Record<string, any>;

const _DEFAULT_SUMMARIZER_TEMPLATE = `入力された複数人の会話ログから、簡潔な要約を作成し、既存の要約を更新してください。
特に固有名詞は必ずそのまま含めてください。
要約には始めに配信者の感情を含めてください。

================================

以下はその例です。
既存の要約:
配信者は少し興奮している。山田太郎は高校生だ。

新しい会話ログ:
リスナー: 山田太郎: 最近ニューヨークに行ってきたんだけど、とても楽しかったよ。
配信者: それはとてもいいですね！私も行ってみたいです！！！！

新しい要約:
配信者は少し興奮している。山田太郎は高校生で、最近ニューヨークに行った。配信者は興奮しながらニューヨークに行きたいと思った。

================================

現在の要約:
{summary}

新しい会話ログ:
{new_lines}

新しい要約:`;

export const SUMMARY_PROMPT = /*#__PURE__*/ new PromptTemplate({
  inputVariables: ["summary", "new_lines"],
  template: _DEFAULT_SUMMARIZER_TEMPLATE,
});

export interface AITuberMemoryInput extends BaseChatMemoryInput {
  llm: BaseLanguageModel;
  memoryKey?: string;
  humanPrefix?: string;
  aiPrefix?: string;
  summarize?: string;
  summaryPrompt?: BasePromptTemplate;
  summaryChatMessageClass?: new (content: string) => BaseChatMessage;
}

export class AITuberMemory extends BaseChatMemory {
  buffer = "";

  memoryKey = "history";

  humanPrefix = "リスナー";

  aiPrefix = "配信者";

  llm: BaseLanguageModel;

  summaryPrompt: BasePromptTemplate = SUMMARY_PROMPT;

  summaryChatMessageClass: new (content: string) => BaseChatMessage =
    SystemChatMessage;

  constructor(fields: AITuberMemoryInput) {
    const {
      returnMessages,
      inputKey,
      outputKey,
      chatHistory,
      humanPrefix,
      aiPrefix,
      llm,
      summarize,
      summaryPrompt,
      summaryChatMessageClass,
    } = fields;

    super({ returnMessages, inputKey, outputKey, chatHistory });

    this.memoryKey = fields?.memoryKey ?? this.memoryKey;
    this.humanPrefix = humanPrefix ?? this.humanPrefix;
    this.aiPrefix = aiPrefix ?? this.aiPrefix;
    this.llm = llm;
    this.buffer = summarize ?? this.buffer;
    this.summaryPrompt = summaryPrompt ?? this.summaryPrompt;
    this.summaryChatMessageClass =
      summaryChatMessageClass ?? this.summaryChatMessageClass;
  }

  get memoryKeys() {
    return [this.memoryKey];
  }

  async predictNewSummary(
    messages: BaseChatMessage[],
    existingSummary: string
  ): Promise<string> {
    const newLines = getBufferString(messages, this.humanPrefix, this.aiPrefix);
    const chain = new LLMChain({ llm: this.llm, prompt: this.summaryPrompt });
    return await chain.predict({
      summary: existingSummary,
      new_lines: newLines,
    });
  }

  async loadMemoryVariables(_: InputValues): Promise<MemoryVariables> {
    if (this.returnMessages) {
      const result = {
        [this.memoryKey]: [new this.summaryChatMessageClass(this.buffer)],
      };
      return result;
    }
    const result = { [this.memoryKey]: this.buffer };
    return result;
  }

  async saveContext(
    inputValues: InputValues,
    outputValues: OutputValues
  ): Promise<void> {
    const newMessages = getInputValue(inputValues);
    for (const message of getInputValue(inputValues))
      await this.chatHistory.addUserMessage(message.text);
    await this.chatHistory.addAIChatMessage(getInputValue(outputValues).text);
    const messages = await this.chatHistory.getMessages();
    this.buffer = await this.predictNewSummary(
      messages.slice(-newMessages.length),
      this.buffer
    );
  }

  async clear() {
    await super.clear();
    this.buffer = "";
  }
}
