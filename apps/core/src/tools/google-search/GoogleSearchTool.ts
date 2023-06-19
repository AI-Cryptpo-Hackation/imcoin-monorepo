import { StructuredTool, Tool } from "langchain/tools";
import { z } from "zod";
import { googleSearch } from "./search";

export interface GoogleToolParams {
  locale: string;
}

export class GoogleTool extends Tool {
  constructor(
    private options: GoogleToolParams = {
      locale: "ja",
    }
  ) {
    super();
  }

  name = "search";
  description =
    "シンプルな検索エンジンです。入力は検索クエリーである必要があります。";

  async _call(query: string) {
    const searchResults = await googleSearch({
      query,
      locale: this.options.locale,
    });
    const results = searchResults
      .map(
        (result) =>
          `title: ${result.title}\ndescription: ${result.description}\nurl: ${result.url}`
      )
      .join("\n\n");

    return "Search Result: \n\n" + results;
  }
}

export class StructuredGoogleTool extends StructuredTool {
  schema = z.object({
    locale: z.string().optional().describe("location"),
    query: z.string().describe("search query"),
  });
  name = "search";
  description =
    "シンプルな検索エンジンです。入力は検索クエリーである必要があります。";

  constructor(
    private options: GoogleToolParams = {
      locale: "us",
    }
  ) {
    super();
  }

  async _call({ query, locale }: z.infer<typeof this.schema>) {
    const searchResults = await googleSearch({
      query,
      locale: locale || this.options.locale,
    });
    const results = searchResults
      .map(
        (result) =>
          `title: ${result.title}\ndescription: ${result.description}\nurl: ${result.url}`
      )
      .join("\n\n");

    return "Search Result: \n\n" + results;
  }
}
