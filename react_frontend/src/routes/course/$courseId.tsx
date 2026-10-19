import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse, useCourseStats, useUpdateLessonProgress, useSavedCourses, useToggleSaveCourse } from "@/hooks/useCourses";
import { LessonPlayer } from "./components/LessonPlayer";
import { ModuleAccordion } from "./components/ModuleAccordion";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { Lesson } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Download,
  BookOpen,
  Layers,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const CourseViewerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, error } = useCourse(courseId);
  const { data: stats } = useCourseStats(courseId);
  const updateProgressMutation = useUpdateLessonProgress();
  const { data: savedData } = useSavedCourses();
  const toggleSaveMutation = useToggleSaveCourse();

  const isSaved = useMemo(() => {
    if (!courseId || !savedData?.items) return false;
    return savedData.items.some((c) => c.id === courseId);
  }, [courseId, savedData]);

  const handleToggleSave = () => {
    if (!courseId) return;
    toggleSaveMutation.mutate(courseId);
  };

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Flatten all lessons in order
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap((m) => m.lessons);
  }, [course]);

  // Set default active lesson to first lesson
  useEffect(() => {
    if (allLessons.length > 0 && !activeLesson) {
      setActiveLesson(allLessons[0]);
    }
  }, [allLessons, activeLesson]);

  const currentIndex = useMemo(() => {
    if (!activeLesson) return 0;
    return allLessons.findIndex((l) => l.id === activeLesson.id);
  }, [allLessons, activeLesson]);

  const handleNextLesson = useCallback(() => {
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    } else {
      toast.success("🎉 You've reached the final lesson of this course!");
    }
  }, [currentIndex, allLessons]);

  const handlePrevLesson = useCallback(() => {
    if (currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1]);
    }
  }, [currentIndex, allLessons]);

  const handleToggleComplete = useCallback(() => {
    if (!activeLesson) return;
    const isCurrentlyDone = completedLessonIds.has(activeLesson.id);

    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyDone) {
        next.delete(activeLesson.id);
      } else {
        next.add(activeLesson.id);
      }
      return next;
    });

    updateProgressMutation.mutate({
      lessonId: activeLesson.id,
      status: isCurrentlyDone ? "in_progress" : "completed",
    });

    if (!isCurrentlyDone) {
      toast.success("Marked Complete ✨");
    }
  }, [activeLesson, completedLessonIds, updateProgressMutation]);

  // Keyboard Shortcuts (J / K / M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        handlePrevLesson();
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        handleNextLesson();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        handleToggleComplete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextLesson, handlePrevLesson, handleToggleComplete]);

  const handleExportMarkdown = async () => {
    if (!courseId) return;
    window.open(`/api/v1/courses/${courseId}/export`, "_blank");
    toast.success("Downloading course syllabus as Markdown...");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Course link copied to clipboard! 🔗");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[500px] lg:col-span-3 rounded-xl" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Course Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested course may have been removed or is currently private.
        </p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const completionPercent = allLessons.length > 0
    ? Math.round((completedLessonIds.size / allLessons.length) * 100)
    : 0;

  return (
    <div className="relative min-h-[92vh] flex flex-col">
      <FloatingOrbs />

      {/* Course Viewer Sub-Bar */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-ghost h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              ← Dashboard
            </button>
            <div className="h-4 w-[1px] bg-border/60" />
            <h2 className="text-sm font-bold font-display text-foreground truncate">
              {course.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Circular Progress Ring */}
            <div className="flex items-center gap-2">
              <ProgressRing progress={completionPercent} size={36} strokeWidth={3} />
              <span className="text-xs font-mono hidden md:inline text-muted-foreground">
                {completedLessonIds.size}/{allLessons.length} Done
              </span>
            </div>

            {/* Save Course Button */}
            <button
              onClick={handleToggleSave}
              title={isSaved ? "Course saved in your library" : "Save this course"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSaved
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "border border-border/80 bg-secondary/60 text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
              <span>{isSaved ? "Saved ✨" : "Save Course"}</span>
            </button>

            <button
              onClick={handleShare}
              title="Share Course"
              className="btn-ghost h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportMarkdown}
              title="Export Syllabus Markdown"
              className="btn-ghost h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Player Area (Left) + Modules Sidebar (Right) */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Player Area */}
        <div className={isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-8"}>
          {activeLesson ? (
            <LessonPlayer
              lesson={activeLesson}
              isCompleted={completedLessonIds.has(activeLesson.id)}
              onToggleComplete={handleToggleComplete}
              onNext={handleNextLesson}
              onPrev={handlePrevLesson}
            />
          ) : (
            <div className="card-base p-12 text-center">
              <p className="text-sm text-muted-foreground">Select a lesson from the syllabus to begin.</p>
            </div>
          )}
        </div>

        {/* Right: Modules & Lessons Collapsible Sidebar */}
        <div
          className={`${
            isSidebarCollapsed ? "hidden lg:block lg:col-span-1" : "lg:col-span-4"
          } space-y-4 transition-all duration-300`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Course Syllabus
              </h3>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="btn-ghost text-[10px] h-7 px-2 text-muted-foreground"
            >
              {isSidebarCollapsed ? "Expand" : "Collapse"}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <ModuleAccordion
              modules={course.modules || []}
              activeLessonId={activeLesson?.id || ""}
              completedLessonIds={completedLessonIds}
              onSelectLesson={(lesson) => setActiveLesson(lesson)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
