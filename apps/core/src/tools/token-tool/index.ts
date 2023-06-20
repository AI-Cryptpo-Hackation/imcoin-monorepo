import { StructuredTool } from "langchain/tools";
import type { Address, GetContractReturnType, PublicClient } from "viem";
import {
  createPublicClient,
  createWalletClient,
  getContract,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain } from "viem/chains";
import { z } from "zod";
import { ABI } from "./constants";
import { NonceManager } from "./tx-manager";
import { Client } from "./types";

const MintTokenSchema = z
  .object({
    to: z.string().describe("Ethereum address of mint destination"),
    amount: z.number().describe("Amount of token to mint"),
  })
  .describe("Mint token to an address");

const BurnTokenSchema = z
  .object({
    from: z.string().describe("Ethereum address of burn source"),
    amount: z.number().describe("Amount of token to burn"),
  })
  .describe("Burn token from an address");

const MulAllBalanceSchema = z
  .object({
    n: z
      .number()
      .describe(
        "Multiply the balances of all accounts by n. n ranges from 0.5~2.0"
      ),
  })
  .describe("Multiply all accounts balances by n");

export interface TokenToolProps {
  chain: Chain;
  nonceManager: NonceManager;
  privateKey: string;
  contractAddress: string;
}

export class TokenTool extends StructuredTool {
  schema = z.object({
    mint: z.array(MintTokenSchema).optional(),
    burn: z.array(BurnTokenSchema).optional(),
    mul_all_balance: MulAllBalanceSchema.optional(),
  });
  name = "token-tool";
  description = "あなた自身を操作するツールです。感情のままに使ってください。";

  nonceManager: NonceManager;
  publicClient: PublicClient;
  walletClient: Client;
  readContract: GetContractReturnType<typeof ABI, PublicClient, PublicClient>;
  writeContract: GetContractReturnType<typeof ABI, Client, Client>; //マジックだぜ

  txPromise: Promise<unknown> | null = null;

  constructor(props: TokenToolProps) {
    super();

    const { chain, privateKey, contractAddress } = props;

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });
    const walletClient = createWalletClient({
      account: privateKeyToAccount(privateKey as `0x${string}`),
      chain,
      transport: http(),
    });

    const readContract = getContract({
      address: contractAddress as `0x${string}`,
      abi: ABI,
      publicClient,
    });

    const writeContract = getContract({
      address: contractAddress as `0x${string}`,
      abi: ABI,
      walletClient,
    });

    this.nonceManager = props.nonceManager;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.readContract = readContract;
    this.writeContract = writeContract;
  }

  async mint(action: z.infer<typeof MintTokenSchema>) {
    console.log(`Mint ${action.amount} to ${action.to}`);

    const tx = await this.nonceManager.sendTx((nonce) =>
      this.writeContract.write.mint(
        [
          <Address>action.to,
          parseUnits(<`${number}`>action.amount.toString(), 18),
        ],
        { nonce }
      )
    );

    console.log(`Mint ${action.amount} to ${action.to} successfully on ${tx}`);

    return `Mint ${action.amount} to ${action.to} successfully!`;
  }

  async burn(action: z.infer<typeof BurnTokenSchema>) {
    console.log(`Burn ${action.amount} from ${action.from}`);

    const tx = await this.nonceManager.sendTx((nonce) =>
      this.writeContract.write.burn(
        [
          <Address>action.from,
          parseUnits(<`${number}`>action.amount.toString(), 18),
        ],
        { nonce }
      )
    );

    console.log(
      `Burn ${action.amount} from ${action.from} successfully on ${tx}`
    );

    return `Burn ${action.amount} from ${action.from} successfully!`;
  }

  async mulAllBalance(action: z.infer<typeof MulAllBalanceSchema>) {
    console.log(`Multiply all accounts balances by ${action.n}`);

    const power = await this.readContract.read.power();
    const newPower = power * (1n / BigInt(action.n));

    const tx = await this.nonceManager.sendTx((nonce) =>
      this.writeContract.write.setPower([newPower], { nonce })
    );

    console.log(
      `Multiply all accounts balances by ${action.n} successfully on ${tx}`
    );

    return `Multiply all accounts balances by ${action.n} successfully!`;
  }

  async _call({ mint, burn, mul_all_balance }: z.infer<typeof this.schema>) {
    let results: string[] = [];

    for (const action of mint || []) {
      results.push(await this.mint(action));
    }

    for (const action of burn || []) {
      results.push(await this.burn(action));
    }

    if (mul_all_balance) {
      results.push(await this.mulAllBalance(mul_all_balance));
    }

    return results.join("\n");
  }
}
