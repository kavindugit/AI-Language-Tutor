import { useState, useEffect } from "react";

export function useLessons() {
  const [lessons, setLessons] = useState([]);

  async function fetchLessons() {
    const res = await fetch("http://localhost:4000/lessons", { credentials: "include" });
    const data = await res.json();
    if (data.success) setLessons(data.lessons);
  }

  async function completeLesson(id) {
    await fetch(`http://localhost:4000/lessons/${id}/complete`, {
      method: "POST",
      credentials: "include",
    });
    await fetchLessons();
  }

  useEffect(() => { fetchLessons(); }, []);

  return { lessons, completeLesson };
}
