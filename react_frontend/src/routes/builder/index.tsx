import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TopicInputStep } from "./steps/TopicInput";
import { SourceSelectionStep } from "./steps/SourceSelection";
import { GenerationStep } from "./steps/Generation";
import { CurationStep } from "./steps/Curation";
import { useCreateCourse, useGenerateCourse, useCourse } from "@/hooks/useCourses";
import { TopicInputFormValues } from "@/lib/validations";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const CourseBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [courseId, setCourseId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    topic: "",
    difficulty: "beginner",
    estimatedHours: 10,
    sources: ["youtube", "web", "github"],
  });

  const createCourseMutation = useCreateCourse();
  const generateCourseMutation = useGenerateCourse();
  const { data: generatedCourse, refetch: refetchCourse } = useCourse(courseId || undefined);

  const stepsHeader = [
    { label: "1. Define Topic", desc: "Scope & level" },
    { label: "2. Select Sources", desc: "Video & docs" },
    { label: "3. AI Pipeline", desc: "Live generation" },
    { label: "4. Curate Syllabus", desc: "Reorder & polish" },
  ];

  // Step 1: Submit Topic -> Create Course Draft
  const handleTopicSubmit = async (values: TopicInputFormValues) => {
    try {
      const draft = await createCourseMutation.mutateAsync({
        title: values.topic,
        difficulty: values.difficulty,
      });
      setCourseId(draft.id);
      setFormData((prev) => ({
        ...prev,
        topic: values.topic,
        difficulty: values.difficulty,
        estimatedHours: values.estimatedHours,
      }));
      setActiveStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create course draft");
    }
  };

  // Step 2: Trigger Generation -> Move to Step 3
  const handleSourcesSubmit = async () => {
    if (!courseId) return;
    try {
      await generateCourseMutation.mutateAsync({
        courseId,
        data: {
          topic: formData.topic,
          difficulty: formData.difficulty,
          sources: formData.sources,
        },
      });
      setActiveStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to trigger course generation");
    }
  };

  // Step 3 -> Step 4: After generation is done
  const handleGenerationDone = async () => {
    await refetchCourse();
    setActiveStep(3);
  };

  // Step 4 -> Finished: Redirect to Course Viewer
  const handleFinishCuration = () => {
    if (courseId) {
      toast.success("Masterclass ready to study! 🌿");
      navigate(`/course/${courseId}`);
    }
  };

  return (
    <div className="relative min-h-[92vh] max-w-5xl mx-auto px-4 py-8 space-y-8">
      <FloatingOrbs />

      {/* Builder Stepper Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-foreground">
                CourseForge Generator
              </h1>
              <p className="text-xs text-muted-foreground">
                Autonomous multi-source curriculum generator
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
            Step {activeStep + 1} of 4
          </span>
        </div>

        {/* Stepper Progress Bar & Tabs */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {stepsHeader.map((step, idx) => {
            const isCompleted = activeStep > idx;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-glow"
                    : isCompleted
                    ? "border-primary/40 bg-card/60 text-foreground"
                    : "border-border/60 bg-card/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                  <span className="truncate">{step.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stepper Content Body */}
      <div className="card-base p-6 sm:p-8 shadow-glow-xl min-h-[420px]">
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TopicInputStep
                initialValues={{
                  topic: formData.topic,
                  difficulty: formData.difficulty,
                  estimatedHours: formData.estimatedHours,
                }}
                onSubmit={handleTopicSubmit}
                isLoading={createCourseMutation.isPending}
              />
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SourceSelectionStep
                selectedSources={formData.sources}
                onChange={(sources) => setFormData({ ...formData, sources })}
                onBack={() => setActiveStep(0)}
                onSubmit={handleSourcesSubmit}
                isLoading={generateCourseMutation.isPending}
              />
            </motion.div>
          )}

          {activeStep === 2 && courseId && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GenerationStep
                courseId={courseId}
                onComplete={handleGenerationDone}
              />
            </motion.div>
          )}

          {activeStep === 3 && generatedCourse && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CurationStep
                course={generatedCourse}
                onFinish={handleFinishCuration}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
