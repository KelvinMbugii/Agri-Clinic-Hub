import { useState } from "react";
import axios from "axios";

export default function FarmerChat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
    if (!message) return;

    const res = await axios.post("/api/ai/chat", { message });
    setReply(res.data.reply);
    setMessage("");
  };

  return (
    <div className="p-4">
      <textarea
        className="border p-2 w-full"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe symptoms or ask about a disease..."
      />
      <button
        className="bg-green-500 text-white px-4 py-2 mt-2"
        onClick={sendMessage}
      >
        Ask AI
      </button>

      {reply && (
        <div className="mt-4 p-4 border rounded bg-gray-50 whitespace-pre-line">
          {reply}
        </div>
      )}
    </div>
  );
}
