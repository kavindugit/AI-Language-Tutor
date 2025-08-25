import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Mic, Volume2, Book, Sparkles, Languages,
  Pause, Repeat2, Lightbulb, Star, CheckCircle2, Plus, Brain
} from "lucide-react";

/**
 * AI Language Tutor — Single-file React Frontend (no shadcn, no '@/components')
 * - Pure React + TailwindCSS + lucide-react + framer-motion
 * - All UI primitives are defined locally here (Button, Card, etc.)
 * - Mocked assistant reply; replace in `sendMessage` with your API
 */

/********* Tiny UI primitives (no external UI lib) *********/
const cn = (...a) => a.filter(Boolean).join(" ");

const Card = ({ className = "", children }) => (
  <div className={cn("bg-white rounded-2xl shadow border border-gray-200", className)}>{children}</div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={cn("px-4 pt-4", className)}>{children}</div>
);
const CardTitle = ({ className = "", children }) => (
  <h2 className={cn("text-base font-semibold", className)}>{children}</h2>
);
const CardContent = ({ className = "", children }) => (
  <div className={cn("px-4 pb-4", className)}>{children}</div>
);
const CardFooter = ({ className = "", children }) => (
  <div className={cn("px-4 pb-4", className)}>{children}</div>
);

const Button = ({ variant = "primary", size = "md", className = "", disabled, title, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[0.99] focus:outline-none focus:ring";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4", lg: "h-12 px-5" };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], disabled && "opacity-60 cursor-not-allowed", className)}
      disabled={disabled}
      title={title}
      {...props}
    />
  );
};

const Input = ({ className = "", ...props }) => (
  <input className={cn("w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring focus:outline-none", className)} {...props} />
);
const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea rows={rows} className={cn("w-full rounded-lg border border-gray-300 p-3 resize-none focus:ring focus:outline-none", className)} {...props} />
);
const Badge = ({ className = "", children }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs", className)}>{children}</span>
);
const Progress = ({ value = 0 }) => (
  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
    <div className="h-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);
const Switch = ({ checked, onChange }) => (
  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
    <input type="checkbox" className="sr-only" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} />
    <span className={cn("h-5 w-9 rounded-full transition", checked ? "bg-blue-600" : "bg-gray-300")}>
      <span className={cn("block h-5 w-5 bg-white rounded-full transition -mt-[2px]", checked ? "translate-x-4" : "translate-x-0")} />
    </span>
  </label>
);

/********* Helpers *********/
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}
const timeString = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const QUICK_PROMPTS = [
  "Explain this sentence",
  "Correct my grammar",
  "Translate to English",
  "Give me a mini-quiz",
  "Roleplay at a café",
  "Teach me 5 verbs",
];

const DEFAULT_LESSON = [
  { id: 1, title: "Greetings & Introductions", done: true },
  { id: 2, title: "Ordering Food", done: false },
  { id: 3, title: "Asking for Directions", done: false },
  { id: 4, title: "Talking About Hobbies", done: false },
];

function mockTutorReply(text, options) {
  const base = text.trim();
  const corrected = base
    .replace(/\bi\b/g, "I")
    .replace(/\bim\b/g, "I'm")
    .replace(/\bdon't\b/gi, "don't")
    .replace(/\s+/g, " ");
  const translations = {
    Spanish: "Traducción (ES): " + corrected,
    French: "Traduction (FR): " + corrected,
    German: "Übersetzung (DE): " + corrected,
    Japanese: "和訳 (JA): " + corrected,
    English: "Translation (EN): " + corrected,
  };
  const parts = [];
  if (options.correctGrammar) parts.push(`✅ Correction: ${corrected}`);
  if (options.explain) parts.push("💡 Explanation: Subject-verb agreement and capitalization improved. Keep sentences concise.");
  if (options.translateTo && options.translateTo !== "None") parts.push("🌐 " + (translations[options.translateTo] || corrected));
  if (options.quiz) parts.push('📝 Mini-quiz: 1) Choose the correct form: "I ___ going" (am/is). 2) Translate "Good morning".');
  if (!parts.length) parts.push("Here's a helpful rephrase: " + corrected);
  return parts.join("\n\n");
}

export default function AILanguageTutor() {
  // State
  const [messages, setMessages] = useLocalStorage("tutor:messages", [
    { id: 1, role: "assistant", text: "Hi! I’m your AI tutor. What would you like to practice today?", t: timeString() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useLocalStorage("tutor:language", "English");
  const [level, setLevel] = useLocalStorage("tutor:level", "A2");
  const [lesson, setLesson] = useLocalStorage("tutor:lesson", DEFAULT_LESSON);
  const [vocab, setVocab] = useLocalStorage("tutor:vocab", [
    { term: "hello", meaning: "a greeting", strength: 0.6 },
    { term: "please", meaning: "polite marker", strength: 0.3 },
  ]);
  const [opts, setOpts] = useLocalStorage("tutor:options", {
    correctGrammar: true, explain: true, quiz: false, autoSpeak: false, translateTo: "None",
  });
  const [mode, setMode] = useLocalStorage("tutor:mode", "Chat"); // Chat | Drill | Roleplay
  const [streak, setStreak] = useLocalStorage("tutor:streak", 1);
  const [xp, setXp] = useLocalStorage("tutor:xp", 20);

  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Text-to-Speech
  const languageToBcp47 = (lang) =>
    ({ English: "en-US", Spanish: "es-ES", French: "fr-FR", German: "de-DE", Japanese: "ja-JP" }[lang] || "en-US");
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.lang = languageToBcp47(language);
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  };

  // Mic (demo)
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recStatus, setRecStatus] = useState("");
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        // TODO: send `blob` to your STT service
        setRecStatus("Audio captured (demo). Hook your STT here.");
      };
      mr.start(); setRecording(true); setRecStatus("Recording...");
    } catch {
      setRecStatus("Mic permission denied or unsupported.");
    }
  };
  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); setRecStatus("Stopped."); };

  // Chat
  const appendUser = (text) => setMessages((m) => [...m, { id: Date.now(), role: "user", text, t: timeString() }]);
  const streamText = async (full, onChunk) => { for (const ch of full) { onChunk(ch); await new Promise((r) => setTimeout(r, 8)); } };

  async function sendMessage(rawText) {
    const text = (rawText ?? input).trim();
    if (!text) return;
    setInput("");
    appendUser(text);
    setSending(true);

    // --- Replace with your backend call ---
    // const res = await fetch('/api/tutor', { method: 'POST', body: JSON.stringify({ text, language, level, options: opts }) });
    // const data = await res.json();
    // const reply = data.reply;

    await new Promise((r) => setTimeout(r, 350));
    const reply = mockTutorReply(text, opts);

    await streamText(reply, (chunk) => {
      setMessages((m) => {
        const last = m[m.length - 1];
        if (last && last.role === "assistant" && last._streaming) {
          return [...m.slice(0, -1), { ...last, text: last.text + chunk }];
        }
        return [...m, { id: Date.now() + 2, role: "assistant", text: chunk, t: timeString(), _streaming: true }];
      });
    });
    setMessages((m) => {
      const last = m[m.length - 1];
      if (!last) return m;
      return [...m.slice(0, -1), { ...last, _streaming: false }];
    });

    setSending(false);
    setXp((x) => Math.min(100, x + 2));
    if (opts.autoSpeak) speak(reply);
  }

  function addToVocab(term, meaning = "") {
    if (!term) return;
    setVocab((v) => (v.some((x) => x.term.toLowerCase() === term.toLowerCase())
      ? v : [{ term, meaning, strength: 0.1 }, ...v].slice(0, 30)));
  }
  const nextDrillItem = () => [...vocab].sort((a, b) => a.strength - b.strength)[0];
  const weakness = useMemo(() => {
    if (!vocab.length) return 0;
    const avg = vocab.reduce((s, v) => s + v.strength, 0) / vocab.length;
    return Math.round((1 - avg) * 100);
  }, [vocab]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Bot className="h-6 w-6" />
          <h1 className="font-semibold">AI Language Tutor</h1>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-yellow-100"><Sparkles className="h-3 w-3"/> {xp} XP</Badge>
            <Badge><Star className="h-3 w-3"/> Streak {streak}d</Badge>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 rounded-lg border px-2">
              {['English','Spanish','French','German','Japanese'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-9 rounded-lg border px-2">
              {['A1','A2','B1','B2','C1','C2'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <Button variant="ghost" size="md" onClick={() => setStreak((s) => s + 1)} title="Increment streak (demo)">
              <Repeat2 className="h-5 w-5"/>
            </Button>
            <Button variant="ghost" size="md" onClick={() => setXp((x) => (x + 10) % 110)} title="Add XP (demo)">
              <Brain className="h-5 w-5"/>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 p-4">
        {/* Chat Column */}
        <section className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2"><Book className="h-5 w-5"/> {mode} Mode</CardTitle>
              {/* Tabs */}
              <div className="rounded-lg bg-gray-100 p-1 flex gap-1">
                {['Chat','Drill','Roleplay'].map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={cn("h-8 px-3 rounded-md text-sm", mode===m?"bg-white shadow":"hover:bg-white/60")}>{m}</button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 pb-3">
                {QUICK_PROMPTS.map((p) => (
                  <Button key={p} variant="secondary" size="sm" className="text-sm h-8" onClick={() => setInput(p)}>{p}</Button>
                ))}
              </div>

              {/* Messages */}
              <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-3" id="chat-scroll">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      <div className={cn("rounded-2xl px-4 py-2 max-w-[80%] shadow-sm", m.role==='user'?'bg-blue-600 text-white':'bg-gray-100')}>
                        <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                        <div className="mt-1 text-[10px] opacity-70 text-right">{m.t}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={endRef} />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              {/* Options */}
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 text-sm"><Switch checked={opts.correctGrammar} onChange={(v)=>setOpts({ ...opts, correctGrammar: v })}/> Grammar</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={opts.explain} onChange={(v)=>setOpts({ ...opts, explain: v })}/> Explain</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={opts.quiz} onChange={(v)=>setOpts({ ...opts, quiz: v })}/> Quiz me</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={opts.autoSpeak} onChange={(v)=>setOpts({ ...opts, autoSpeak: v })}/> Auto-speak</label>
                <div className="col-span-2 md:col-span-1">
                  <select value={opts.translateTo} onChange={(e)=>setOpts({ ...opts, translateTo: e.target.value })} className="h-9 w-full rounded-lg border px-2">
                    {['None','English','Spanish','French','German','Japanese'].map((l)=> <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Composer */}
              <div className="w-full flex items-end gap-2">
                <Textarea
                  placeholder={`Practice ${language}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[52px]"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <div className="flex flex-col gap-2">
                  <Button variant={recording ? 'destructive' : 'secondary'} size="md"
                          onClick={recording ? stopRecording : startRecording}
                          title={recording ? "Stop recording" : "Speak"}>
                    {recording ? <Pause className="h-4 w-4"/> : <Mic className="h-4 w-4"/>}
                  </Button>
                  <Button size="md" variant="secondary" onClick={() => speak(input || 'Hello!')} title="Listen">
                    <Volume2 className="h-4 w-4"/>
                  </Button>
                </div>
                <Button className="h-[52px]" onClick={() => sendMessage()} disabled={sending}>
                  {sending ? <span className="animate-pulse">Sending</span> : (<span className="inline-flex items-center gap-2"><Send className="h-4 w-4"/> Send</span>)}
                </Button>
              </div>
              {recStatus && <div className="text-xs text-gray-500">{recStatus}</div>}
            </CardFooter>
          </Card>

          {/* Drill / Roleplay helpers */}
          {mode !== 'Chat' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5"/> {mode === 'Drill' ? 'Practice Drill' : 'Roleplay Scenario'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mode === 'Drill' ? (
                  <div className="space-y-3">
                    <p className="text-sm">Fill the blank: “I ___ going to the market.”</p>
                    <div className="flex gap-2">
                      {['am','is','are'].map((c) => (
                        <Button key={c} variant="outline" onClick={() => sendMessage(`My answer: ${c}`)}>{c}</Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm">You are at a café in {language === 'English' ? 'London' : 'Madrid'}. Order a drink and ask about pastries.</p>
                    <div className="flex gap-2">
                      {["Greet the barista","Ask for a menu","Order a latte","Ask price of croissant"].map((a) => (
                        <Button key={a} variant="secondary" onClick={() => sendMessage(a)}>{a}</Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lesson.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2 py-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={cn("h-4 w-4", l.done ? 'text-green-600' : 'text-gray-400')} />
                    <span className={l.done ? 'line-through text-gray-400' : ''}>{l.title}</span>
                  </div>
                  {!l.done && (
                    <Button size="sm" variant="outline" onClick={() => {
                      setLesson((ls) => ls.map(x => x.id === l.id ? { ...x, done: true } : x));
                      setXp((x) => Math.min(100, x + 8));
                    }}>Complete</Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => setLesson((ls) => [...ls, { id: Date.now(), title: "New custom task", done: false }])}>
                <Plus className="h-4 w-4"/> Add task
              </Button>
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1"><span>Unit Progress</span><span>{xp}%</span></div>
                <Progress value={xp} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Deck</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Add a term" id="term" />
                <Button onClick={() => {
                  const el = document.getElementById('term');
                  const val = el?.value?.trim();
                  if (val) { addToVocab(val); el.value = ''; }
                }}>Add</Button>
              </div>
              <div className="text-xs text-gray-500">Deck weakness: {weakness}% (lower is better)</div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {vocab.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border p-2">
                    <div>
                      <div className="font-medium">{v.term}</div>
                      <div className="text-xs text-gray-500">{v.meaning || '—'}</div>
                    </div>
                    <div className="w-32"><Progress value={v.strength * 100} /></div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => {
                  const item = nextDrillItem();
                  if (item) sendMessage(`Use the word "${item.term}" in a sentence and correct me.`);
                }}>
                  Review weakest
                </Button>
                <Button variant="outline" size="sm" onClick={() => setVocab((v) => v.map(x => ({ ...x, strength: Math.max(0, x.strength - 0.1) })))}>
                  Make harder
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips & Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                {["Pronunciation","Past Tense","Polite Forms","Numbers","Food"].map(t => (
                  <Badge key={t} className="bg-gray-100 cursor-pointer" onClick={() => setInput(`Teach me ${t.toLowerCase()} with examples.`)}>{t}</Badge>
                ))}
              </div>
              <div className="rounded-lg bg-gray-100 p-3 leading-relaxed">
                Try roleplay to improve speaking confidence. Use the mic and request: “Give me feedback on my pronunciation.”
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-6 text-xs text-gray-500">
        Built as a demo UI. Replace the mock with your API and you’re good to go ✨
      </footer>
    </div>
  );
}
