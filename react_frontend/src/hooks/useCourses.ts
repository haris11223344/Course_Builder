import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Course, CourseListResponse, CourseStats } from "@/types";
import { toast } from "sonner";

export const useCourses = (page: number = 1, status?: string) => {
  return useQuery<CourseListResponse>({
    queryKey: ["courses", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), page_size: "12" });
      if (status) params.append("status", status);
      const res = await api.get<CourseListResponse>(`/courses?${params.toString()}`);
      return res.data;
    },
  });
};

export const useCourse = (courseId?: string) => {
  return useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID missing");
      const res = await api.get<Course>(`/courses/${courseId}`);
      return res.data;
    },
    enabled: !!courseId,
  });
};

export const useCourseStats = (courseId?: string) => {
  return useQuery<CourseStats>({
    queryKey: ["course-stats", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID missing");
      const res = await api.get<CourseStats>(`/progress/course/${courseId}`);
      return res.data;
    },
    enabled: !!courseId,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; difficulty?: string }) => {
      const res = await api.post<Course>("/courses", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useGenerateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      data,
    }: {
      courseId: string;
      data: { topic: string; difficulty: string; sources: string[] };
    }) => {
      const res = await api.post(`/courses/${courseId}/generate`, data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["course", vars.courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useCurateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: any }) => {
      const res = await api.patch<Course>(`/courses/${courseId}/curate`, data);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["course", updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Curated syllabus saved! ✨");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update syllabus");
    },
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      status,
      watchTimeSeconds,
    }: {
      lessonId: string;
      status?: string;
      watchTimeSeconds?: number;
    }) => {
      const res = await api.post(`/progress/lesson/${lessonId}`, {
        status,
        watch_time_seconds: watchTimeSeconds,
      });
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["course-stats"] });
    },
  });
};

export const useSavedCourses = () => {
  return useQuery<CourseListResponse>({
    queryKey: ["saved-courses"],
    queryFn: async () => {
      const res = await api.get<CourseListResponse>("/courses/user/saved");
      return res.data;
    },
  });
};

export const useToggleSaveCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.post(`/courses/${courseId}/save`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(data.message || (data.is_saved ? "Course bookmarked! ✨" : "Course removed from bookmarks"));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update bookmark");
    },
  });
};

