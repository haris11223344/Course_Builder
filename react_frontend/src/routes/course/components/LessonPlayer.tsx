import React, { useState } from "react";
import { Lesson, Resource } from "@/types";
import { ProgressRing } from "@/components/ui/progress-ring";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  Video,
  FileText,
  ExternalLink,
  CheckCircle,
  Share2,
  BookOpen,
  Github,
  Globe,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";

interface LessonPlayerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  isCompleted,
  onToggleComplete,
  onNext,
  onPrev,
}) => {
  const [activeTab, setActiveTab] = useState<"video" | "notes" | "resources">("video");

  const videoResources = (lesson.resources || []).filter(
    (r) => r.type === "video" || (r.url && r.url.includes("youtube"))
  );

  const primaryVideo =
    videoResources.find((r) => r.is_primary) ||
    videoResources[0];

  const [selectedVideo, setSelectedVideo] = useState<Resource | null>(primaryVideo || null);

  // Sync selected video when active lesson changes
  React.useEffect(() => {
    const vids = (lesson.resources || []).filter(
      (r) => r.type === "video" || (r.url && r.url.includes("youtube"))
    );
    const prim = vids.find((r) => r.is_primary) || vids[0];
    setSelectedVideo(prim || null);
  }, [lesson.id, lesson.resources]);

  const activeVideo = selectedVideo || primaryVideo;
  const videoId = activeVideo?.provider_id || (activeVideo?.url ? activeVideo.url.split("v=")[1]?.split("&")[0] : null) || "zF34dRivLOw";

  const markdownNotes =
    lesson.description ||
    `### Key Takeaways for ${lesson.title}

In this lecture, we study the core architectural invariants, mental models, and production implementations.

\`\`\`
// Lesson Architecture Specification
// Topic: ${lesson.title}
\`\`\`

#### Learning Objectives:
- Master core mental models and implementation semantics
- Understand practical architecture and common edge cases
- Review real-world examples and verifiable milestones
`;

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Active Lecture
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              ⏱ {lesson.duration_minutes || 25} mins
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground mt-1">
            {lesson.title}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleComplete}
            className={
              isCompleted
                ? "btn-ghost text-primary text-xs h-9 px-4 border border-primary/30"
                : "btn-primary text-xs h-9 px-4 animate-pulse-glow"
            }
          >
            <CheckCircle className="w-4 h-4" />
            {isCompleted ? "Completed ✨" : "Mark Complete [M]"}
          </button>
        </div>
      </div>

      {/* Media & Content Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "video"
              ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Video className="w-3.5 h-3.5" /> Video Lecture {videoResources.length > 1 ? `(${videoResources.length})` : ""}
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "notes"
              ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Synchronized Notes
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "resources"
              ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" /> All Resources ({lesson.resources?.length || 0})
        </button>
      </div>

      {/* Multi-video switcher if lesson has multiple lectures */}
      {activeTab === "video" && videoResources.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-card/60 border border-border/60">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase mr-1">
            Lectures:
          </span>
          {videoResources.map((v, vIdx) => {
            const isSelected = (activeVideo?.id && activeVideo.id === v.id) || activeVideo?.provider_id === v.provider_id;
            return (
              <button
                key={v.id || vIdx}
                onClick={() => setSelectedVideo(v)}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-glow"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Video className="w-3 h-3" />
                Lecture {vIdx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Player Display */}
      {activeTab === "video" && (
        <div className="space-y-4">
          <div
            key={`${lesson.id}-${videoId}`}
            className="relative aspect-video bg-black/80 rounded-xl overflow-hidden border border-border/80 shadow-glow-lg"
          >
            <iframe
              key={`iframe-${videoId}`}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
              title={activeVideo?.title || lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground p-3.5 rounded-xl bg-card/75 border border-border/60">
            <div className="flex items-center gap-2 truncate">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <span className="font-semibold text-foreground truncate">
                {activeVideo?.title || lesson.title}
              </span>
            </div>
            {activeVideo?.url && (
              <a
                href={activeVideo.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 shrink-0 font-medium ml-auto"
              >
                Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Notes Markdown Viewer */}
      {activeTab === "notes" && (
        <div className="card-base p-6 prose prose-invert max-w-none text-xs sm:text-sm prose-pre:bg-background/90 prose-pre:border prose-pre:border-border/60 prose-headings:text-foreground prose-a:text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {markdownNotes}
          </ReactMarkdown>
        </div>
      )}

      {/* Curated Links Grid */}
      {activeTab === "resources" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lesson.resources?.map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="card-base p-4 group hover:border-primary/50 transition-all block"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-primary font-bold">
                    {res.type}
                  </span>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mt-0.5 line-clamp-1">
                    {res.title}
                  </h4>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-1">
                {res.url}
              </p>
            </a>
          ))}
        </div>
      )}

      {/* Bottom Paging Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-border/40 text-xs">
        <button
          onClick={onPrev}
          className="btn-outline text-xs h-9 px-4"
        >
          ← Previous Lesson [J]
        </button>

        <span className="text-muted-foreground font-mono hidden sm:inline">
          Keyboard shortcuts: [J] Prev • [K] Next • [M] Complete
        </span>

        <button
          onClick={onNext}
          className="btn-primary text-xs h-9 px-5"
        >
          Next Lesson [K] →
        </button>
      </div>
    </div>
  );
};
