import { NextRequest } from "next/server";

import { requireApiSession } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await context.params;

  try {
    const session = await requireApiSession();
    const progress = await db.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.id, lessonId } },
    });
    return ok(progress);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await context.params;

  try {
    const session = await requireApiSession();
    const body = await request.json();
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });
    if (!lesson) return fail("Lesson not found.", 404);

    const progress = await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.id, lessonId } },
      update: {
        lastPositionSeconds: Number(body.lastPositionSeconds || 0),
        completedAt: body.completed ? new Date() : null,
      },
      create: {
        userId: session.id,
        lessonId,
        lastPositionSeconds: Number(body.lastPositionSeconds || 0),
        completedAt: body.completed ? new Date() : null,
      },
    });

    const totalLessons = await db.lesson.count({
      where: { courseId: lesson.courseId },
    });
    const completedLessons = await db.lessonProgress.count({
      where: {
        userId: session.id,
        lesson: { courseId: lesson.courseId },
        completedAt: { not: null },
      },
    });

    await db.courseProgress.upsert({
      where: {
        userId_courseId: { userId: session.id, courseId: lesson.courseId },
      },
      update: {
        completedLessons,
        completionRate: totalLessons ? completedLessons / totalLessons : 0,
      },
      create: {
        userId: session.id,
        courseId: lesson.courseId,
        completedLessons,
        completionRate: totalLessons ? completedLessons / totalLessons : 0,
      },
    });

    return ok(progress);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to save progress.",
      400,
    );
  }
}
