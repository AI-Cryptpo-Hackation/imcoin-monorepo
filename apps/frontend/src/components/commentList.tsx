import { FC, useEffect, useRef } from "react";

export type Comment = {
  address: string;
  text: string;
  username: string;
  profileImageUrl: string;
  createdAt: number;
}

type Props = {
  comments: Comment[];
}

export const CommentList: FC<Props> = ({ comments }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  return (
    <div className="absolute right-16 mt-[80px] w-[462px] overflow-y-auto max-h-[450px]">
      <div className="mx-auto max-w-4xl w-full p-16 flex-wrap bg-black bg-opacity-60">

        {comments.map((comment, index) => (
          <div key={index} className="py-4">
            <div className="flex flex-row w-[462px]">
              <img src={comment.profileImageUrl} alt={comment.username} className="bg-white object-cover h-24 w-24 rounded-[32px] m-4"/>
              <span className="px-4 text-white break-words typography-4 font-M_PLUS_2 whitespace-pre-wrap overflow-wrap-break-word">{comment.username}: {comment.text}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};