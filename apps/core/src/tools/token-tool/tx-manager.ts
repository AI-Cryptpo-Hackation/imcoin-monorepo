import {
  Address,
  BlockTag,
  PublicClient,
  createPublicClient,
  http,
} from "viem";
import { Chain } from "viem/chains";

export const createNonceManager = (chain: Chain, address: string) => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  return new NonceManager(publicClient, <Address>address);
};

export class NonceManager {
  client: PublicClient;
  address: `0x${string}`;
  #noncePromise: null | Promise<number>;
  #delta: number;

  constructor(client: PublicClient, address: `0x${string}`) {
    this.client = client;
    this.address = address;
    this.#noncePromise = null;
    this.#delta = 0;
  }

  async getNonce(blockTag?: BlockTag): Promise<number> {
    if (blockTag === "pending") {
      if (this.#noncePromise == null) {
        this.#noncePromise = this.client.getTransactionCount({
          address: this.address,
          blockTag: "pending",
        });
      }

      const delta = this.#delta;
      return (await this.#noncePromise) + delta;
    }

    return this.client.getTransactionCount({
      address: this.address,
    });
  }

  increment(): void {
    this.#delta++;
  }

  reset(): void {
    this.#delta = 0;
    this.#noncePromise = null;
  }

  async sendTx<T>(txCb: (nonce: number) => Promise<T>): Promise<T> {
    const noncePromise = this.getNonce("pending");
    this.increment();
    console.log(await noncePromise);
    const tx = await txCb(await noncePromise);

    return tx;
  }
}
