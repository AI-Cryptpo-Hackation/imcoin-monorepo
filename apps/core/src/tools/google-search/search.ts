import { JSDOM } from "jsdom";
import { FETCH_OPTION, SEARCH_ENDPOINT } from "./constants";

export interface SearchOptions {
  query: string;
  locale: string;
  page?: number;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export const googleSearch = async (opt: SearchOptions): Promise<SearchResult[]> => {
  const { query, locale = "us", page = 1 } = opt;
  const queryParam = new URLSearchParams({
    q: query,
    gl: locale,
    start: page ? String(page * 10) : "0",
  });
  const response = await fetch(`${SEARCH_ENDPOINT}?${queryParam.toString()}`, FETCH_OPTION);
  const html = await response.text();
  const dom = new JSDOM(html);
  const results = Array.from(
    dom.window.document.querySelectorAll("#search .MjjYud .kvH3mc").values()
  ).map((el) => {
    return {
      title: el.querySelector(".LC20lb")?.textContent || "",
      url: el.querySelector("a")?.href || "",
      description: el.querySelector(".VwiC3b")?.textContent || "",
    };
  });

  return results;
};
