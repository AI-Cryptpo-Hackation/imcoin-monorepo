import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { loadSummarizationChain } from "langchain/chains";
import { BaseChatModel } from "langchain/chat_models/base";
import { Embeddings } from "langchain/embeddings/base";
import { TokenTextSplitter } from "langchain/text_splitter";
import { StructuredTool } from "langchain/tools";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { z } from "zod";
import { FETCH_OPTIONS } from "./constants";

const splitter = new TokenTextSplitter({
  encodingName: "cl100k_base",
  chunkSize: 800,
  chunkOverlap: 100,
});

export class WebBrowser extends StructuredTool {
  schema = z.object({
    url: z.string(),
    findAbout: z
      .string()
      .optional()
      .describe(
        "ページの中で見つけたいもの。指定しない場合はページ全体を要約します。"
      ),
  });
  name = "web-browser";
  description =
    "Webサイトから何かを探したり、要約したりします。有効なURL、サイトで見つけたいものを教えてください。";

  model: BaseChatModel;
  embeddings: Embeddings;

  constructor(model: BaseChatModel, embeddings: Embeddings) {
    super();
    this.model = model;
    this.embeddings = embeddings;
  }

  protected async _call(arg: {
    url: string;
    findAbout?: string;
  }): Promise<string> {
    const maybeHTML = await fetch(arg.url, FETCH_OPTIONS).then((res) =>
      res.text()
    );
    const result = await Promise.resolve(maybeHTML)
      .then((html) => new JSDOM(html))
      .then((dom) => new Readability(dom.window.document).parse());
    const title = result?.title || "No title";
    const content = result?.textContent || maybeHTML;

    const docs = await splitter.createDocuments([content]);

    if (arg.findAbout) {
      const mostRelatedDocs = await MemoryVectorStore.fromDocuments(
        docs,
        this.embeddings
      ).then((store) => store.similaritySearch(arg.findAbout as string, 4));
      const context =
        `${title}\n\n` +
        mostRelatedDocs.map((doc) => doc.pageContent).join("\n\n");
      const prompt = `Text:${context}\n\nI need ${arg.findAbout} from the above text, also provide up to 5 markdown links from within that would be of interest (always including URL and text). Links should be provided, if present, in markdown syntax as a list under the heading "Relevant Links:".`;
      const response = await this.model.predict(prompt);
      return response;
    } else {
      const chain = loadSummarizationChain(this.model, { type: "map_reduce" });
      const { text: summarize } = await chain.call({ input_documents: docs });

      return summarize;
    }
  }
}
