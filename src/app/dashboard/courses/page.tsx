import { CoursePlayer } from "@/components/dashboard/course-player";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/lib/services/catalog";

export default async function DashboardCoursesPage() {
  const session = await getSession();
  const overview = await getDashboardOverview(session!.id);
  const firstCourse = overview.progress[0]?.course;

  if (!firstCourse) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-[#666666]">
          You have not purchased any courses yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Continue learning
      </h1>
      <CoursePlayer lessons={firstCourse.lessons} />
    </div>
  );
}
