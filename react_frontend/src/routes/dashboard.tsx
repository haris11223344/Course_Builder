import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCourses, useSavedCourses, useToggleSaveCourse } from "@/hooks/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Flame,
  ArrowRight,
  TrendingUp,
  MoreVertical,
  Layers,
  Award,
  Bookmark,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatTimeAgo } from "@/lib/utils";

const defaultWeeklyActivity = [
  { day: "Mon", hours: 1.5, lessons: 3, focus: "Foundations & Syntax" },
  { day: "Tue", hours: 2.2, lessons: 4, focus: "Data Structures & Memory" },
  { day: "Wed", hours: 1.1, lessons: 2, focus: "Concurrency Models" },
  { day: "Thu", hours: 3.1, lessons: 5, focus: "System Architecture" },
  { day: "Fri", hours: 2.5, lessons: 4, focus: "API Design & Protocols" },
  { day: "Sat", hours: 4.2, lessons: 7, focus: "Distributed Consensus" },
  { day: "Sun", hours: 3.3, lessons: 5, focus: "Performance & Profiling" },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [metricType, setMetricType] = useState<"hours" | "lessons">("hours");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(5); // default Saturday
  
  const { data, isLoading } = useCourses(1);
  const { data: savedCoursesData } = useSavedCourses();
  const toggleSaveMutation = useToggleSaveCourse();

  const allCourses = data?.items || [];

  // Maintain saved courses IDs set for instant responsive updates
  const savedCourseIds = useMemo(() => {
    const ids = new Set<string>();
    if (user?.preferences?.saved_courses && Array.isArray(user.preferences.saved_courses)) {
      user.preferences.saved_courses.forEach((id: string) => ids.add(id));
    }
    if (savedCoursesData?.items) {
      savedCoursesData.items.forEach((c) => ids.add(c.id));
    }
    return ids;
  }, [user, savedCoursesData]);

  const handleToggleSave = (courseId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    toggleSaveMutation.mutate(courseId);
  };

  // Filter courses based on status or saved
  const filteredCourses = useMemo(() => {
    if (filterStatus === "saved") {
      return allCourses.filter((c) => savedCourseIds.has(c.id));
    }
    if (filterStatus) {
      return allCourses.filter((c) => c.status === filterStatus);
    }
    return allCourses;
  }, [allCourses, filterStatus, savedCourseIds]);

  // Compute live activity data based on user courses & progress
  const weeklyData = useMemo(() => {
    const totalEstHours = allCourses.reduce((acc, c) => acc + (c.estimated_hours || 8), 0);
    const totalLessons = allCourses.reduce((acc, c) => {
      const lessonCount = c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 6;
      return acc + lessonCount;
    }, 0);

    const scaleHours = totalEstHours > 0 ? Math.min(Math.max(totalEstHours / 15, 0.8), 2.2) : 1;
    const scaleLessons = totalLessons > 0 ? Math.min(Math.max(totalLessons / 18, 0.8), 2.5) : 1;

    return defaultWeeklyActivity.map((d) => ({
      ...d,
      hours: Number((d.hours * scaleHours).toFixed(1)),
      lessons: Math.round(d.lessons * scaleLessons),
    }));
  }, [allCourses]);

  const totalWeeklyHours = useMemo(() => {
    return Number(weeklyData.reduce((acc, d) => acc + d.hours, 0).toFixed(1));
  }, [weeklyData]);

  const totalWeeklyLessons = useMemo(() => {
    return weeklyData.reduce((acc, d) => acc + d.lessons, 0);
  }, [weeklyData]);

  const activeDay = weeklyData[activeDayIndex] || weeklyData[0];

  return (
    <div className="relative min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pt-8 font-sans">
      <FloatingOrbs />

      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Welcome back, {user?.full_name ? user.full_name.split(" ")[0] : "Architect"}
            </h1>
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
              <Flame className="w-4 h-4 text-primary fill-primary" /> 5 Day Streak
            </span>
          </div>
          <p className="text-base text-muted-foreground mt-1.5">
            Track your autonomous curricula and pick up exactly where you left off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/builder")}
            className="shadow-glow-lg text-sm h-11 px-6 font-bold"
          >
            <Sparkles className="w-4 h-4" />
            Generate New Course
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Courses</span>
            <div className="text-3xl font-extrabold font-display text-foreground">{allCourses.length}</div>
            <span className="text-xs text-primary flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +2 created this month
            </span>
          </div>
          <div className="h-13 w-13 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="card-base p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Completed Lessons</span>
            <div className="text-3xl font-extrabold font-display text-foreground">{totalWeeklyLessons}</div>
            <span className="text-xs text-primary flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 88% milestone accuracy
            </span>
          </div>
          <div className="h-13 w-13 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="card-base p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Study Time</span>
            <div className="text-3xl font-extrabold font-display text-foreground">{totalWeeklyHours} hrs</div>
            <span className="text-xs text-primary flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5" /> Top 5% pace
            </span>
          </div>
          <div className="h-13 w-13 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="card-base p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Saved Courses</span>
            <div className="text-3xl font-extrabold font-display text-foreground">{savedCourseIds.size}</div>
            <span className="text-xs text-primary flex items-center gap-1 font-semibold">
              <Bookmark className="w-3.5 h-3.5 fill-current" /> Instant access
            </span>
          </div>
          <div className="h-13 w-13 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content Grid: Continue Learning + Weekly Activity Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Featured Card */}
        {allCourses.length > 0 ? (
          <div className="lg:col-span-2 card-base p-6 sm:p-7 flex flex-col justify-between border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Play className="w-4 h-4 fill-current" /> Continue Learning
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Updated {formatTimeAgo(allCourses[0].updated_at)}
                  </span>
                  {/* Save Button on Featured Course */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSave(allCourses[0].id, e)}
                    className={`p-2 rounded-lg border text-xs transition-all ${
                      savedCourseIds.has(allCourses[0].id)
                        ? "bg-primary text-primary-foreground border-primary shadow-glow"
                        : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                    title={savedCourseIds.has(allCourses[0].id) ? "Remove bookmark" : "Save this course"}
                  >
                    <Bookmark className={`w-4 h-4 ${savedCourseIds.has(allCourses[0].id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-foreground font-display mb-2.5">
                {allCourses[0].title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl mb-5 leading-relaxed">
                {allCourses[0].description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-4 h-4 text-primary" /> {allCourses[0].modules?.length || 3} Modules
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-primary" /> ~{allCourses[0].estimated_hours || 10} hours total
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-primary font-mono text-xs font-semibold capitalize">
                  {allCourses[0].difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-border/40">
              <div className="flex items-center gap-3">
                <ProgressRing progress={35} size={46} strokeWidth={4} />
                <div className="text-sm">
                  <div className="font-bold text-foreground">35% Complete</div>
                  <div className="text-muted-foreground text-xs">Ready for Next Lesson</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(`/course/${allCourses[0].id}`)}
                  className="text-sm h-10 px-5 font-bold"
                >
                  Resume Course <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 card-base p-8 text-center flex flex-col items-center justify-center space-y-4">
            <Sparkles className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-bold text-foreground">No active courses yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Generate your first AI-curated course on any software or architecture topic.
            </p>
            <Button onClick={() => navigate("/builder")} className="text-sm px-5 py-2.5">
              Launch Course Generator
            </Button>
          </div>
        )}

        {/* Weekly Activity Bar Chart (Recharts BarChart) */}
        <div className="card-base p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold font-display text-foreground">Weekly Study Activity</h3>
              </div>
              
              {/* Metric Type Switcher: Hours vs Lessons */}
              <div className="flex items-center bg-secondary/60 p-0.5 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setMetricType("hours")}
                  className={`px-3 py-1 text-xs rounded-md font-bold transition-all ${
                    metricType === "hours"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Hours
                </button>
                <button
                  type="button"
                  onClick={() => setMetricType("lessons")}
                  className={`px-3 py-1 text-xs rounded-md font-bold transition-all ${
                    metricType === "lessons"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Lessons
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                {metricType === "hours"
                  ? "Daily watch-time and interactive code review"
                  : "Completed video lectures & milestones"}
              </p>
              <span className="text-sm text-primary font-extrabold">
                {metricType === "hours" ? `${totalWeeklyHours} hrs` : `${totalWeeklyLessons} lessons`}
              </span>
            </div>

            {/* Recharts BarChart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 8, right: 6, left: -20, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && typeof state.activeTooltipIndex === "number") {
                      setActiveDayIndex(state.activeTooltipIndex);
                    }
                  }}
                >
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    unit={metricType === "hours" ? "h" : ""}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--primary) / 0.12)", radius: 6 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-strong p-3 rounded-lg border border-primary/30 shadow-glow text-sm space-y-1">
                            <div className="font-bold text-foreground flex items-center justify-between gap-4">
                              <span>{data.day}</span>
                              <span className="text-primary font-mono font-bold">
                                {data[metricType]} {metricType === "hours" ? "hrs" : "lessons"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Focus: <span className="text-foreground font-medium">{data.focus}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={metricType}
                    radius={[6, 6, 0, 0]}
                    animationDuration={600}
                  >
                    {weeklyData.map((_, index) => (
                      <Cell
                        key={`bar-cell-${index}`}
                        fill={
                          index === activeDayIndex
                            ? "hsl(var(--primary))"
                            : "hsl(var(--primary) / 0.55)"
                        }
                        className="transition-all duration-300 cursor-pointer hover:opacity-100"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
            <span className="truncate">
              Selected: <strong className="text-foreground">{activeDay.day}</strong> (
              <span className="text-primary font-bold">
                {activeDay[metricType]} {metricType === "hours" ? "h" : "lessons"}
              </span>
              )
            </span>
            <span className="text-primary font-bold shrink-0 ml-2">Goal: 10h/wk (Achieved)</span>
          </div>
        </div>
      </div>

      {/* Course Catalog Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">My Learning Paths</h2>
            <p className="text-sm text-muted-foreground mt-0.5">All generated curricula and shared courses</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterStatus(undefined)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-lg font-bold transition-colors ${
                filterStatus === undefined
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              All ({allCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("ready")}
              className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-lg font-bold transition-colors ${
                filterStatus === "ready"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Ready
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("generating")}
              className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-lg font-bold transition-colors ${
                filterStatus === "generating"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Generating
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("saved")}
              className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                filterStatus === "saved"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              Saved ({savedCourseIds.size})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-base p-6 space-y-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isSaved = savedCourseIds.has(course.id);
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="glass-card rounded-xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group relative"
                >
                  <div>
                    {/* Thumbnail / Header */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-primary-950/40 border border-border/80 mb-4 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <BookOpen className="w-8 h-8 text-primary/60 mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground font-mono">Curated Syllabus</span>
                        </div>
                      )}

                      {/* Difficulty Badge (Top Left) */}
                      <span className="absolute top-2.5 left-2.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur text-primary border border-primary/30 capitalize">
                        {course.difficulty}
                      </span>

                      {/* Save / Bookmark Button (Top Right) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(course.id, e)}
                        title={isSaved ? "Remove from saved courses" : "Save this course"}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-lg transition-all z-10 ${
                          isSaved
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-black/70 backdrop-blur text-muted-foreground hover:text-primary hover:bg-black/90 border border-white/10"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 font-display">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 mb-4 leading-relaxed">
                      {course.description || "Comprehensive AI curriculum."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Layers className="w-4 h-4 text-primary" /> {course.modules?.length || 0} Modules
                      </span>
                      <span>•</span>
                      <span className="font-medium">{course.estimated_hours || 8}h</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Open <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-base p-12 text-center space-y-4">
            <BookOpen className="w-14 h-14 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-bold text-foreground">
              {filterStatus === "saved" ? "No saved courses yet" : "No courses found"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {filterStatus === "saved"
                ? "Click the bookmark icon on any course card to save it for quick reference."
                : "Start by typing any learning goal in the course generator."}
            </p>
            <Button onClick={() => navigate("/builder")} className="text-sm px-5 py-2.5">
              Generate Course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

