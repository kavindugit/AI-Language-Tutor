// frontend/src/pages/Home.jsx
import React, { useState } from "react";
import { Bot, Sparkles, Star, Brain, Repeat2 } from "lucide-react";
import ChatBox from "../components/ChatBox";
import LessonPlan from "../components/LessonPlan";
import VocabDeck from "../components/VocabDeck";
import TipsPanel from "../components/TipsPanel";

// --- Small local UI primitives (no ui/ folder needed) ---
const cn = (...a) => a.filter(Boolean).join(" ");

const Badge = ({ className = "", children }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs", className)}>
    {children}
  </span>
);

const Button = ({ variant = "ghost", size = "md", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-lg transition active:scale-95";
  const variants = {
    ghost: "hover:bg-gray-100",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
  };
  const sizes = {
    sm: "h-8 px-2 text-sm",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};

export default function Home() {
  const [xp, setXp] = useState(20);
  const [streak, setStreak] = useState(1);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Bot className="h-6 w-6" />
          <h1 className="font-semibold">AI Language Tutor</h1>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-yellow-100">
              <Sparkles className="h-3 w-3" /> {xp} XP
            </Badge>
            <Badge>
              <Star className="h-3 w-3" /> Streak {streak}d
            </Badge>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setStreak((s) => s + 1)}
            >
              <Repeat2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setXp((x) => (x + 10) % 110)}
            >
              <Brain className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <main className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 p-4">
        <section>
          <ChatBox />
        </section>
        <aside className="space-y-4">
          <LessonPlan xp={xp} setXp={setXp} />
          <VocabDeck />
          <TipsPanel />
        </aside>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-6 text-xs text-gray-500">
        Built as a demo UI. Hook it up to your backend ✨
      </footer>
    </div>
  );
}
