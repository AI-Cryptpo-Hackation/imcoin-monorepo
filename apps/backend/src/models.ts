import { HyperObject } from "@inaridiy/hyper-objects";
import { $object, $string, Infer } from "lizod";

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

  static async send(command: SendCommentCommand) {
    //TODO: validate signature

    const comment = await Comment.new({
      address: command.address,
      username: command.username,
      text: command.text,
      createdAt: new Date(),
    });

    return comment;
  }
}
