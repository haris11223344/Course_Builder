import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { topicInputSchema, TopicInputFormValues } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_OPTIONS } from "@/lib/constants";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

interface TopicInputProps {
  initialValues: { topic: string; difficulty: string; estimatedHours: number };
  onSubmit: (values: TopicInputFormValues) => void;
  isLoading?: boolean;
}

export const TopicInputStep: React.FC<TopicInputProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicInputFormValues>({
    resolver: zodResolver(topicInputSchema),
    defaultValues: {
      topic: initialValues.topic,
      difficulty: initialValues.difficulty as any,
      estimatedHours: initialValues.estimatedHours,
    },
  });

  const selectedDifficulty = watch("difficulty");

  const suggestionPills = [
    "Learn Rust for WebAssembly",
    "Distributed Systems in Go",
    "Next.js 14 Concurrency & Server Actions",
    "PostgreSQL Internals & Query Optimization",
    "Kubernetes Production Cluster Architecture",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic">What do you want to master?</Label>
        <Input
          id="topic"
          placeholder="e.g. Learn Rust for High-Performance WebAssembly"
          className="text-base py-3"
          error={!!errors.topic}
          {...register("topic")}
        />
        {errors.topic && (
          <p className="text-xs text-destructive">{errors.topic.message}</p>
        )}

        {/* Suggestion Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Suggestions:
          </span>
          {suggestionPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setValue("topic", pill, { shouldValidate: true })}
              className="text-[11px] px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-primary/15 hover:text-primary transition-colors text-muted-foreground"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Radio Cards */}
      <div className="space-y-2">
        <Label>Target Depth & Experience Level</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTY_OPTIONS.map((diff) => {
            const isSelected = selectedDifficulty === diff.value;
            return (
              <div
                key={diff.value}
                onClick={() => setValue("difficulty", diff.value as any)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground glow-inner font-semibold"
                    : "border-border/80 bg-background/50 hover:bg-secondary/60 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-foreground capitalize">{diff.label}</span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{diff.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Hours */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="estimatedHours">Estimated Target Curriculum Length</Label>
          <span className="text-xs font-mono font-bold text-primary">
            {watch("estimatedHours")} hours
          </span>
        </div>
        <input
          type="range"
          min="4"
          max="30"
          step="2"
          className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
          {...register("estimatedHours", { valueAsNumber: true })}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>4h (Crash Course)</span>
          <span>12h (Deep Study)</span>
          <span>30h (Complete Bootcamp)</span>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading} className="text-xs h-10 px-6">
          {isLoading ? (
            "Initializing Draft..."
          ) : (
            <>
              Next: Select Media Sources <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
