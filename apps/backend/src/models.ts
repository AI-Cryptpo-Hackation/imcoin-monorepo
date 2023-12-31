import { HyperObject } from "@inaridiy/hyper-objects";
import { executeAITuber } from "core";
import { HumanChatMessage } from "langchain/schema";
import { $object, $string, Infer } from "lizod";
import { embeddings, toolModel, tuberModel } from "./env";
import { getBalance } from "./libs";

export interface SendCommentCommand {
  address: string;
  username: string;
  text: string;
  signature: string;
}

export const CommentSchema = $object({
  address: $string,
  username: $string,
  text: $string,
  createdAt: (v: any): v is Date => v instanceof Date,
});

export type CommentProps = Infer<typeof CommentSchema>;

export class Comment extends HyperObject<CommentProps> {
  static type = "comment";
  static schema = CommentSchema;

  prompt = `{username}: {address}: {balance}CTN: {text}`;

  static async send(command: SendCommentCommand) {
    const comment = await Comment.new({
      address: command.address,
      username: command.username,
      text: command.text,
      createdAt: new Date(),
    });

    return comment;
  }

  static async getHistorySnapshot() {
    const comments = await Comment.query().order("createdAt", "desc").limit(20);
    // YouTubeとかに習ってASCにする
    return comments.map((c) => c.snapshot()).reverse();
  }

  toHumanChatMessage() {
    return new HumanChatMessage(
      this.prompt
        .replace("{username}", this.props.username)
        .replace("{address}", this.props.address)
        .replace("{balance}", getBalance(this.props.address).toString())
        .replace("{text}", this.props.text)
    );
  }
}

export const LiverSchema = $object({
  response: $string,
  summarize: $string,
  createdAt: (v: any): v is Date => v instanceof Date,
});

export type LiverProps = Infer<typeof LiverSchema>;

export class Liver extends HyperObject<LiverProps> {
  static type = "liver";
  static schema = LiverSchema;

  static async execute() {
    const last = await Liver.query().order("createdAt", "desc").first();
    const lastExecuteTime = last?.props.createdAt || new Date(0);
    const comments = await Comment.query().gt("createdAt", lastExecuteTime);

    const onLiverSay = (text: string) => {
      console.log("Liver said:", text);
      Liver.new({
        response: text,
        summarize: last?.props.summarize || "",
        createdAt: new Date(),
      });
    };

    const { summarize } = await executeAITuber({
      model: tuberModel(),
      modelForTools: toolModel(),
      embeddings: embeddings(),
      messages: comments.map((comment) => comment.toHumanChatMessage()),
      summarize: last?.props.summarize || "",
      onMessage: onLiverSay,
    });

    console.log("Liver summarized:", summarize);
  }
}

export const ActionSchema = $object({
  action: $string,
  createdAt: (v: any): v is Date => v instanceof Date,
});

export type ActionProps = Infer<typeof ActionSchema>;

export class Action extends HyperObject<ActionProps> {
  static type = "action";
  static schema = ActionSchema;

  static async send(action: string) {
    const _action = await Action.new({
      action,
      createdAt: new Date(),
    });

    return _action;
  }

  static async getHistorySnapshot() {
    const action = await Action.query().order("createdAt", "desc").first();
    return action?.snapshot();
  }
}

