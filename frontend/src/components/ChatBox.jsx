import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Pause, Volume2, Book } from "lucide-react";

/* --- Local UI helpers --- */
const cn = (...a) => a.filter(Boolean).join(" ");

const Button = ({ variant = "primary", size = "md", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4", lg: "h-12 px-5" };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};

const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea
    rows={rows}
    className={cn("w-full rounded-lg border border-gray-300 p-3 resize-none focus:ring focus:outline-none", className)}
    {...props}
  />
);

const Switch = ({ checked, onChange }) => (
  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      className="sr-only"
      checked={!!checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
    <span
      className={cn(
        "h-5 w-9 rounded-full transition flex items-center",
        checked ? "bg-blue-600" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "block h-4 w-4 bg-white rounded-full transition ml-[2px]",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </span>
  </label>
);

/* --- Helpers --- */
const timeString = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* --- Main ChatBox --- */
export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I’m your AI tutor. What would you like to practice today?",
      t: timeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [opts, setOpts] = useState({
    correctGrammar: true,
    explain: true,
    autoSpeak: false,
  });

  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const appendUser = (text) =>
    setMessages((m) => [
      ...m,
      { id: Date.now(), role: "user", text, t: timeString() },
    ]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    appendUser(text);
    setSending(true);

    // Mocked assistant
    await new Promise((r) => setTimeout(r, 300));
    setMessages((m) => [
      ...m,
      {
        id: Date.now() + 1,
        role: "assistant",
        text: "✅ Correction: " + text,
        t: timeString(),
      },
    ]);

    setSending(false);
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[75vh]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Book className="h-5 w-5" /> Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-[75%] shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>
                <div className="mt-1 text-[10px] opacity-70 text-right">
                  {m.t}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2 my-3 text-sm">
        <label className="flex items-center gap-2">
          <Switch
            checked={opts.correctGrammar}
            onChange={(v) => setOpts({ ...opts, correctGrammar: v })}
          />{" "}
          Grammar
        </label>
        <label className="flex items-center gap-2">
          <Switch
            checked={opts.explain}
            onChange={(v) => setOpts({ ...opts, explain: v })}
          />{" "}
          Explain
        </label>
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => alert("Mic demo")}>
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={() => alert("Speaker demo")}>
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="h-[52px]"
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? "..." : <><Send className="h-4 w-4" /> Send</>}
        </Button>
      </div>
    </div>
  );
}
