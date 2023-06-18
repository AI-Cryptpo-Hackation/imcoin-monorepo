import { buildUrl } from "@/utils/buildUrl";

export const AssistantText = ({ message, action = 'コメントユーザー全員に10ETH配布' }: { message: string, action?: string }) => {
  return (
    <div className="absolute bottom-0 left-0 mb-104 w-1/4">
      <div className="mx-auto max-w-4xl w-full p-16 flex-wrap">
        <div className="bg-black bg-opacity-60 rounded-8 flex flex-row">
          <div className="flex items-center justify-center min-h-[64px] min-w-[64px] m-24">
            <img src={buildUrl("/assistant.png")} className="bg-white object-cover h-64 w-64 rounded-[32px]" />
          </div>
          <div className="flex-1 px-8 py-16 w-1/3">
            <div className="line-clamp-4 text-white opacity-100 text-secondary typography-16 font-M_PLUS_2 font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
          <div className="flex-1 w-1/3 min-w-[120px] px-8 py-16">
            {/* この要素を親要素の縦いっぱいに広げたい */}
            <div className="flex items-center h-full flex-grow">
              <div className="text-white mx-8 font-bold text-xl">＞</div>
              <div>
                <div className="p-4 line-clamp-4 text-white opacity-100 typography-16 font-M_PLUS_2 font-bold">
                  行動
                </div>
                <div className="p-8 line-clamp-4 text-white opacity-100 typography-16 font-M_PLUS_2">
                  {action}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
