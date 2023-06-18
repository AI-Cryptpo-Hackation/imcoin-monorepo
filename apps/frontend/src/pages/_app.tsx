import "@/styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';

import "@charcoal-ui/icons";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
