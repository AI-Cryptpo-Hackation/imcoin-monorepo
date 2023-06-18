import { HyperObject } from "@inaridiy/hyper-objects";
import { executeAITuber } from "core";
import { HumanChatMessage } from "langchain/schema";
import { $object, $string, Infer } from "lizod";
import { embeddings, tuberModel } from "./env";

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

  prompt = `{username}:
{text}`;

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
    return comments.map((c) => c.snapshot());
  }

  toHumanChatMessage() {
    return new HumanChatMessage(
      this.prompt
        .replace("{username}", this.props.username)
        //      .replace("{address}", this.props.address)
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
      embeddings: embeddings(),
      messages: comments.map((comment) => comment.toHumanChatMessage()),
      summarize: last?.props.summarize || "",
      onMessage: onLiverSay,
    });

    console.log("Liver summarized:", summarize);
  }
}
