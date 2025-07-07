import { Bot as BotIcon } from "lucide-react";

export default function Bot() {
  return (
    <>
      {/* Bot Button */}
      <button
        className="fixed bottom-4 right-4 bg-[#003466] hover:bg-[#004a99] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50"
        onClick={() => {
          window.location.href =
            "https://ai-chat-dan49cb8sbvhnskksjtxbu.streamlit.app/";
        }}
      >
        <BotIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Bot</span>
      </button>
    </>
  );
}
