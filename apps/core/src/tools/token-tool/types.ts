import type { Account, Transport, WalletClient } from "viem";
import { Chain } from "viem/chains";

export type Client = WalletClient<Transport, Chain, Account>;
