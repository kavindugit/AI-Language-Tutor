import { useState, useEffect } from "react";

export function useVocab() {
  const [vocab, setVocab] = useState([]);

  async function fetchVocab() {
    const res = await fetch("http://localhost:4000/vocab", { credentials: "include" });
    const data = await res.json();
    if (data.success) setVocab(data.vocab);
  }

  async function addTerm(term, meaning = "") {
    const res = await fetch("http://localhost:4000/vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ term, meaning }),
    });
    await fetchVocab();
  }

  useEffect(() => { fetchVocab(); }, []);

  return { vocab, addTerm, fetchVocab };
}
