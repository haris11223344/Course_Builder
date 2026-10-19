import React, { useState } from "react";
import { Course, Module, Lesson, Resource } from "@/types";
import { useCurateCourse } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  FileCode,
  Github,
  Globe,
  Sparkles,
  Save,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CurationStepProps {
  course: Course;
  onFinish: () => void;
}

// Sortable Lesson Item Component
const SortableLessonCard: React.FC<{
  lesson: Lesson;
  moduleId: string;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
}> = ({ lesson, moduleId, onDelete, onUpdateTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border/80 bg-background/70 backdrop-blur-sm p-3.5 space-y-3 transition-all duration-200 hover:border-primary/40 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary p-1"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                onUpdateTitle(title);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  onUpdateTitle(title);
                }
              }}
              autoFocus
              className="input-field text-xs py-1 h-7 flex-1"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-foreground truncate cursor-text hover:text-primary"
              title="Click to edit lesson title"
            >
              {lesson.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-ghost h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="btn-ghost h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Resource Drawer */}
      {isExpanded && (
        <div className="pt-2 border-t border-border/40 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Curated Resources ({lesson.resources?.length || 0})</span>
            <span className="text-primary font-mono">{lesson.duration_minutes || 20}m video</span>
          </div>

          <div className="space-y-1.5">
            {lesson.resources?.map((res, idx) => (
              <div
                key={res.id || idx}
                className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/50 text-[11px]"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Video className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate text-foreground font-medium">{res.title}</span>
                  {res.is_primary && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary uppercase font-bold shrink-0">
                      Primary
                    </span>
                  )}
                </div>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary shrink-0 p-1"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const CurationStep: React.FC<CurationStepProps> = ({ course, onFinish }) => {
  const [modules, setModules] = useState<Module[]>(course.modules || []);
  const curateMutation = useCurateCourse();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleLessonDragEnd = (event: DragEndEvent, moduleId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const oldIndex = mod.lessons.findIndex((l) => l.id === active.id);
        const newIndex = mod.lessons.findIndex((l) => l.id === over.id);
        return {
          ...mod,
          lessons: arrayMove(mod.lessons, oldIndex, newIndex),
        };
      })
    );
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.filter((l) => l.id !== lessonId),
        };
      })
    );
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson-custom-${Date.now()}`,
      module_id: moduleId,
      title: "New Custom Lesson",
      order: 99,
      duration_minutes: 20,
      resources: [],
      created_at: new Date().toISOString(),
    };

    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: [...mod.lessons, newLesson],
        };
      })
    );
  };

  const updateLessonTitle = (moduleId: string, lessonId: string, newTitle: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((l) => (l.id === lessonId ? { ...l, title: newTitle } : l)),
        };
      })
    );
  };

  const handleSaveAndStart = async () => {
    // Format payload for backend curation PATCH
    const payload = {
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      modules: modules.map((m, m_idx) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order: m_idx,
        lessons: m.lessons.map((l, l_idx) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          order: l_idx,
          duration_minutes: l.duration_minutes,
          resources: l.resources.map((r, r_idx) => ({
            id: r.id,
            title: r.title,
            url: r.url,
            type: r.type,
            thumbnail_url: r.thumbnail_url,
            provider: r.provider,
            provider_id: r.provider_id,
            duration_seconds: r.duration_seconds,
            order: r_idx,
            is_primary: r.is_primary,
          })),
        })),
      })),
    };

    await curateMutation.mutateAsync({
      courseId: course.id,
      data: payload,
    });
    onFinish();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Step 4: Interactive Syllabus Curation
          </span>
          <h2 className="text-xl font-bold font-display text-foreground mt-0.5">
            {course.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            Drag to reorder lessons, inline edit lesson titles, or add custom notes before starting.
          </p>
        </div>

        <Button
          onClick={handleSaveAndStart}
          disabled={curateMutation.isPending}
          className="text-xs h-10 px-5 shadow-glow"
        >
          {curateMutation.isPending ? "Saving Curriculum..." : "Save & Begin Learning ✨"}
        </Button>
      </div>

      {/* Modules Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {modules.map((mod, modIdx) => (
          <div key={mod.id} className="card-base p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase font-bold">
                  Module {modIdx + 1}
                </span>
                <h3 className="text-sm font-bold text-foreground truncate">{mod.title}</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                {mod.lessons.length} lessons
              </span>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleLessonDragEnd(e, mod.id)}
            >
              <SortableContext
                items={mod.lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {mod.lessons.map((lesson) => (
                    <SortableLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      moduleId={mod.id}
                      onDelete={() => deleteLesson(mod.id, lesson.id)}
                      onUpdateTitle={(title) => updateLessonTitle(mod.id, lesson.id, title)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              type="button"
              onClick={() => addLesson(mod.id)}
              className="btn-outline w-full text-xs h-8 border-dashed border-border/80 hover:border-primary/50 text-muted-foreground hover:text-primary"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lesson
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
