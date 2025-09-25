import React from "react";
import { useLessons } from "../hooks/useLessons";

export default function LessonPlan({ xp, setXp }) {
  const { lessons, completeLesson } = useLessons();

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-2">Lesson Plan</h2>
      <div className="space-y-2">
        {lessons.map((lesson) => (
          <div
            key={lesson._id}
            className="flex items-center justify-between gap-2 py-1"
          >
            <div className="flex items-center gap-2">
              {lesson.done ? (
                <span className="text-green-600">✔</span>
              ) : (
                <span className="text-gray-400">○</span>
              )}
              <span
                className={
                  lesson.done ? "line-through text-gray-400" : "font-medium"
                }
              >
                {lesson.title}
              </span>
            </div>
            {!lesson.done && (
              <button
                onClick={async () => {
                  await completeLesson(lesson._id);
                  setXp((x) => Math.min(100, x + 10));
                }}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
              >
                Complete
              </button>
            )}
          </div>
        ))}
        {!lessons.length && (
          <p className="text-xs text-gray-400">No lessons found.</p>
        )}
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Unit Progress</span>
          <span>{xp}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-600 h-2 rounded"
            style={{ width: `${xp}%` }}
          />
        </div>
      </div>
    </div>
  );
}
