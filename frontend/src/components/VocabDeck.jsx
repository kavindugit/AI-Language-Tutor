import React, { useState } from "react";
import { useVocab } from "../hooks/useVocab";

export default function VocabDeck() {
  const { vocab, addTerm } = useVocab();
  const [term, setTerm] = useState("");

  const handleAdd = async () => {
    if (!term.trim()) return;
    await addTerm(term);
    setTerm("");
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-2">Vocabulary Deck</h2>
      <div className="flex gap-2 mb-3">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="flex-1 border rounded p-2 text-sm"
          placeholder="Add a term"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {vocab.map((v) => (
          <div
            key={v._id}
            className="flex items-center justify-between rounded border p-2"
          >
            <div>
              <div className="font-medium">{v.term}</div>
              <div className="text-xs text-gray-500">{v.meaning || "—"}</div>
            </div>
            <div className="w-24 bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${(v.strength || 0) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {!vocab.length && (
          <p className="text-xs text-gray-400">No terms yet. Add some!</p>
        )}
      </div>
    </div>
  );
}
