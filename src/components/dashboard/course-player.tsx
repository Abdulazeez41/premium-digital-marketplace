"use client";

import { Lesson } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CoursePlayer({ lessons }: { lessons: Lesson[] }) {
  const [activeLesson, setActiveLesson] = useState(lessons[0]);

  if (!activeLesson) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[28px] border border-[#ECECEC] bg-black">
          <video
            key={activeLesson.id}
            controls
            className="aspect-video w-full"
            src={activeLesson.videoUrl}
          />
        </div>
        <div className="rounded-[28px] border border-[#ECECEC] bg-white p-6">
          <h2 className="text-2xl font-semibold text-[#1F1F1F]">
            {activeLesson.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#666666]">
            {activeLesson.description}
          </p>
          <Button
            className="mt-5"
            onClick={async () => {
              const response = await fetch(
                `/api/course-progress/${activeLesson.id}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    completed: true,
                    lastPositionSeconds: 0,
                  }),
                },
              );
              const result = await response.json();
              if (!response.ok) {
                toast.error(result.message || "Unable to save progress.");
                return;
              }
              toast.success("Lesson marked as completed.");
            }}
          >
            Mark lesson complete
          </Button>
        </div>
      </div>
      <div className="rounded-[28px] border border-[#ECECEC] bg-white p-4">
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => setActiveLesson(lesson)}
              className={`w-full rounded-2xl px-4 py-4 text-left transition-colors ${activeLesson.id === lesson.id ? "bg-[#7A1F2B] text-white" : "hover:bg-[#F4F4F5]"}`}
            >
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">
                Lesson {index + 1}
              </p>
              <p className="mt-1 text-sm font-medium">{lesson.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
