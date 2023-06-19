import { StructuredTool } from "langchain/tools";
import { z } from "zod";

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

export class TokenTool extends StructuredTool {
  schema = z.object({
    mint: z.array(MintTokenSchema).optional(),
    burn: z.array(BurnTokenSchema).optional(),
    mul_all_balance: MulAllBalanceSchema.optional(),
  });
  name = "token-tool";
  description = "あなた自身を操作するツールです。感情のままに使ってください。";

  async mint(action: z.infer<typeof MintTokenSchema>) {
    console.log(`Mint ${action.amount} to ${action.to}`);
    return `Mint ${action.amount} to ${action.to} successfully!`;
  }

  async burn(action: z.infer<typeof BurnTokenSchema>) {
    console.log(`Burn ${action.amount} from ${action.from}`);
    return `Burn ${action.amount} from ${action.from} successfully!`;
  }

  async mulAllBalance(action: z.infer<typeof MulAllBalanceSchema>) {
    console.log(`Multiply all accounts balances by ${action.n}`);
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
