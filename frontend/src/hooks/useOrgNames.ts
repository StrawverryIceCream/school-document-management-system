import { useEffect, useState } from "react";
import { getCourseById } from "@/api/courses";
import { getCollegeById } from "@/api/colleges";
import type { College, Course } from "@/types";

// Module-level caches, so each college/course is fetched once no matter how many cards open
const collegeCache = new Map<string, College>();
const courseCache = new Map<string, Course>();

// The profile API only returns collegeId and courseId, so this looks up the names
export function useOrgNames(
  collegeId?: string | null,
  courseId?: string | null,
) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const jobs: Promise<void>[] = [];

    if (collegeId && !collegeCache.has(collegeId)) {
      jobs.push(
        getCollegeById(collegeId)
          .then((c) => void collegeCache.set(collegeId, c))
          .catch(() => {}),
      );
    }
    if (courseId && !courseCache.has(courseId)) {
      jobs.push(
        getCourseById(courseId)
          .then((c) => void courseCache.set(courseId, c))
          .catch(() => {}),
      );
    }

    if (jobs.length > 0) {
      void Promise.all(jobs).then(() => {
        if (!cancelled) setVersion((v) => v + 1); // re-render with the new names
      });
    }
    return () => {
      cancelled = true;
    };
  }, [collegeId, courseId]);

  return {
    college: collegeId ? (collegeCache.get(collegeId) ?? null) : null,
    course: courseId ? (courseCache.get(courseId) ?? null) : null,
  };
}
