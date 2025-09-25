import React from "react";

export default function TipsPanel() {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-2">
      <h2 className="font-semibold mb-2">Tips & Targets</h2>
      <div className="flex flex-wrap gap-2">
        {["Pronunciation", "Past Tense", "Polite Forms", "Numbers", "Food"].map((t) => (
          <span
            key={t}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200"
            onClick={() => alert(`Teach me ${t.toLowerCase()} with examples`)}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="rounded bg-gray-100 p-3 text-sm">
        Try roleplay to improve speaking confidence. Use the mic and request:
        <br />“Give me feedback on my pronunciation.”
      </div>
    </div>
  );
}
