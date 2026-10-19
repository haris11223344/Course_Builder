import React, { useState } from "react";
import { Module, Lesson } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Play, BookOpen, Layers } from "lucide-react";

interface ModuleAccordionProps {
  modules: Module[];
  activeLessonId: string;
  completedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  modules,
  activeLessonId,
  completedLessonIds,
  onSelectLesson,
}) => {
  // Track open module accordion indices
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => {
    // Open all modules by default so the user immediately sees all content
    return new Set(modules.map((_, i) => i));
  });

  // Auto-expand module containing active lesson
  React.useEffect(() => {
    if (!activeLessonId || modules.length === 0) return;
    const activeModIdx = modules.findIndex((m) =>
      m.lessons.some((l) => l.id === activeLessonId)
    );
    if (activeModIdx !== -1) {
      setOpenIndices((prev) => new Set([...prev, activeModIdx]));
    }
  }, [activeLessonId, modules]);

  const toggleModule = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenIndices(new Set(modules.map((_, i) => i)));
  };

  const collapseAll = () => {
    setOpenIndices(new Set());
  };

  return (
    <div className="space-y-3">
      {/* Control sub-bar */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pb-1">
        <span>{modules.length} Modules • {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons</span>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span>•</span>
          <button
            onClick={collapseAll}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>
      {modules.map((mod, modIdx) => {
        const isOpen = openIndices.has(modIdx);
        const moduleCompletedCount = mod.lessons.filter((l) => completedLessonIds.has(l.id)).length;

        return (
          <div
            key={mod.id}
            className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-200"
          >
            {/* Module Accordion Header */}
            <button
              onClick={() => toggleModule(modIdx)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-secondary/40 transition-colors"
            >
              <div className="space-y-0.5 truncate pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-primary uppercase font-bold">
                    Module {modIdx + 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {moduleCompletedCount}/{mod.lessons.length}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground truncate">{mod.title}</h4>
              </div>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Collapsible Lessons List with AnimatePresence */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-border/40"
                >
                  <div className="p-2 space-y-1 bg-background/40">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === activeLessonId;
                      const isCompleted = completedLessonIds.has(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary glow-inner"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>

                          <span className="text-[10px] font-mono shrink-0 text-muted-foreground">
                            {lesson.duration_minutes || 20}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
