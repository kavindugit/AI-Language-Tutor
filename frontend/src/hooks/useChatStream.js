import { useState } from "react";

export function useChatStream() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(text, options = {}) {
    if (!text) return;
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text }]);

    const response = await fetch("http://localhost:4000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, options }),
    });

    const reader = response.body.getReader();
    let buffer = "";
    let aiMessage = { role: "assistant", text: "" };
    setMessages((prev) => [...prev, aiMessage]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);
      const events = buffer.split("\n\n").filter(Boolean);
      buffer = "";

      for (const ev of events) {
        if (ev.startsWith("data:")) {
          const payload = JSON.parse(ev.replace("data: ", ""));
          if (payload.token) {
            aiMessage.text += payload.token;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...aiMessage };
              return updated;
            });
          }
        }
      }
    }
    setLoading(false);
  }

  return { messages, sendMessage, loading };
}
