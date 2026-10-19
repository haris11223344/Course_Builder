import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useCourses";
import { SavedResource, SavedResourceListResponse } from "@/types";
import { Card } from "@/components/ui/card";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import {
  Bookmark,
  ExternalLink,
  Trash2,
  Video,
  FileCode,
  Github,
  Search,
  Filter,
  BookOpen,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<"courses" | "resources">("courses");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: savedCoursesData, isLoading: isLoadingCourses } = useSavedCourses();
  const toggleSaveCourse = useToggleSaveCourse();

  const savedCourses = savedCoursesData?.items || [];

  const { data, isLoading, refetch } = useQuery<SavedResourceListResponse>({
    queryKey: ["saved-resources"],
    queryFn: async () => {
      const res = await api.get<SavedResourceListResponse>("/resources/library");
      return res.data;
    },
  });

  const savedItems: SavedResource[] = data?.items || [
    {
      id: "saved-1",
      user_id: "u1",
      resource_id: "r1",
      personal_note: "Fundamental memory allocation pattern for concurrency",
      tags: ["rust", "memory", "concurrency"],
      created_at: new Date().toISOString(),
      resource: {
        id: "r1",
        lesson_id: "l1",
        title: "Rust Crash Course | Traversy Media",
        url: "https://www.youtube.com/watch?v=zF34dRivLOw",
        type: "video" as any,
        provider: "youtube",
        provider_id: "zF34dRivLOw",
        duration_seconds: 6840,
        metadata_: { channel: "Traversy Media" },
        order: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      },
    },
    {
      id: "saved-2",
      user_id: "u1",
      resource_id: "r2",
      personal_note: "Official RFC on WebAssembly garbage collection",
      tags: ["wasm", "spec"],
      created_at: new Date().toISOString(),
      resource: {
        id: "r2",
        lesson_id: "l2",
        title: "WebAssembly Specifications & Core Runtime",
        url: "https://developer.mozilla.org/en-US/docs/WebAssembly",
        type: "doc" as any,
        provider: "doc",
        duration_seconds: 0,
        metadata_: { authority: "Official MDN" },
        order: 1,
        is_primary: false,
        created_at: new Date().toISOString(),
      },
    },
  ];

  const handleUnsave = async (resourceId: string) => {
    try {
      await api.delete(`/resources/unsave/${resourceId}`);
      toast.success("Resource removed from library");
      refetch();
    } catch {
      toast.error("Failed to remove resource");
    }
  };

  const filtered = savedItems.filter((item: SavedResource) => {
    if (filterType !== "all" && item.resource?.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.resource?.title?.toLowerCase().includes(q);
      const noteMatch = item.personal_note?.toLowerCase().includes(q);
      return titleMatch || noteMatch;
    }
    return true;
  });

  const filteredCourses = savedCourses.filter((course) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        (course.description && course.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="relative min-h-[92vh] max-w-6xl mx-auto px-4 py-8 space-y-6">
      <FloatingOrbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-extrabold font-display text-foreground">
              Saved Knowledge Library
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Bookmarked courses, lectures, GitHub repositories, and architectural references.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={mainTab === "courses" ? "Search saved courses..." : "Search resources..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field text-xs pl-8 pr-3 py-1.5 h-9 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Mode Toggle: Saved Courses vs Saved Resources */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-3">
        <button
          type="button"
          onClick={() => setMainTab("courses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mainTab === "courses"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Saved Courses ({savedCourses.length})
        </button>

        <button
          type="button"
          onClick={() => setMainTab("resources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mainTab === "resources"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Bookmarked Resources ({savedItems.length})
        </button>
      </div>

      {/* COURSES TAB VIEW */}
      {mainTab === "courses" && (
        <div className="space-y-4">
          {isLoadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-base p-6 space-y-4">
                  <div className="h-36 bg-secondary/60 animate-pulse rounded-lg" />
                  <div className="h-5 bg-secondary/60 animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-secondary/60 animate-pulse rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="glass-card rounded-xl p-5 flex flex-col justify-between cursor-pointer group relative"
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
                          <span className="text-[10px] text-muted-foreground font-mono">Curated Syllabus</span>
                        </div>
                      )}
                      
                      <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-primary border border-primary/30 capitalize">
                        {course.difficulty}
                      </span>

                      {/* Remove Bookmark Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveCourse.mutate(course.id);
                        }}
                        title="Remove from saved courses"
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 backdrop-blur text-primary hover:bg-destructive hover:text-destructive-foreground transition-all border border-primary/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 font-display">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-4">
                      {course.description || "Comprehensive AI curriculum."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-primary" /> {course.modules?.length || 0} Modules
                      </span>
                      <span>•</span>
                      <span>{course.estimated_hours || 8}h</span>
                    </div>

                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-base p-12 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold text-foreground">No saved courses yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Bookmark courses on the dashboard or inside the course viewer to find them here instantly.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-primary text-xs px-4 py-2"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESOURCES TAB VIEW */}
      {mainTab === "resources" && (
        <div className="space-y-6">
          {/* Filter Sub-Tabs */}
          <div className="flex items-center gap-2 text-xs">
            {["all", "video", "doc", "github"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                  filterType === tab
                    ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {tab === "all" ? "All Items" : `${tab}s`}
              </button>
            ))}
          </div>

          {/* Library Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="card-base p-5 flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-mono text-primary uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10">
                      {item.resource?.type || "resource"}
                    </span>
                    <button
                      onClick={() => handleUnsave(item.resource_id)}
                      title="Remove bookmark"
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {item.resource?.title || "Educational Resource"}
                  </h3>

                  {item.personal_note && (
                    <p className="text-xs text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border/60 mt-3 italic">
                      "{item.personal_note}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    {item.resource?.provider || "Web"}
                  </span>
                  <a
                    href={item.resource?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    Open Source <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

