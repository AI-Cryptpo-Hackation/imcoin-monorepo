import { FC } from "react";

type Comment = {
  id: number;
  text: string;
  author: string;
  profileImageUrl: string;
}

type Props = {
  comments: Comment[];
}

export const CommentList: FC<Props> = ({ comments }) => {

  return (
    <div className="absolute right-16 mt-[80px] w-[462px] overflow-y-auto max-h-[450px]">
      <div className="mx-auto max-w-4xl w-full p-16 flex-wrap bg-black bg-opacity-60">

        {comments.map((comment) => (
          <div key={comment.id} className="py-4">
            <div className="flex flex-row w-[462px]">
              <img src={comment.profileImageUrl} alt={comment.author} className="bg-white object-cover h-24 w-24 rounded-[32px] m-4"/>
              <span className="px-4 text-white break-words typography-4 font-M_PLUS_2 whitespace-pre-wrap overflow-wrap-break-word">{comment.author}: {comment.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};