import React, { useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { motion } from "framer-motion";
import { Sparkles, Cpu, Search, CheckCircle2, Save, Terminal, AlertCircle } from "lucide-react";

interface GenerationStepProps {
  courseId: string;
  onComplete: () => void;
}

export const GenerationStep: React.FC<GenerationStepProps> = ({
  courseId,
  onComplete,
}) => {
  const { event, isConnected } = useWebSocket(courseId);

  useEffect(() => {
    if (event?.stage === "done") {
      const timer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [event, onComplete]);

  const stages = [
    { id: "planning", label: "Curriculum Architect", icon: Cpu, desc: "Syllabus structuring & scope" },
    { id: "searching", label: "Multi-Source Search", icon: Search, desc: "YouTube, GitHub & DevDocs mining" },
    { id: "ranking", label: "Semantic Scoring", icon: Sparkles, desc: "Diversity & quality scoring" },
    { id: "saving", label: "Tree Persistence", icon: Save, desc: "Database snapshot & indices" },
  ];

  const currentStage = event?.stage || "planning";
  const progressPercent = event?.progress || 15;

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case "planning":
        return 0;
      case "searching":
        return 1;
      case "ranking":
        return 2;
      case "saving":
      case "done":
        return 3;
      default:
        return 0;
    }
  };

  const activeIdx = getStageIndex(currentStage);

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {isConnected ? "WEBSOCKET STREAM ACTIVE" : "SYNCHRONIZING STREAM"}
        </span>
        <h2 className="text-2xl font-bold font-display text-foreground">
          Autonomous AI Generation Pipeline
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {event?.message || "Architecting curriculum syllabus and finding verified tutorial sources..."}
        </p>
      </div>

      {/* Animated Pipeline Nodes Visualization */}
      <div className="relative py-6">
        {/* Horizontal Connector Line */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-secondary rounded-full -z-0">
          <motion.div
            className="h-full bg-primary glow"
            initial={{ width: "10%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 relative z-10">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = activeIdx > idx || currentStage === "done";
            const isActive = activeIdx === idx && currentStage !== "done";

            return (
              <div key={stage.id} className="flex flex-col items-center text-center space-y-2">
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                    isCompleted
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : isActive
                      ? "bg-card text-primary border-primary glow-lg ring-4 ring-primary/20"
                      : "bg-card text-muted-foreground border-border/80"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </motion.div>

                <div>
                  <h4
                    className={`text-xs font-bold ${
                      isActive ? "text-primary font-semibold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Live Event Log */}
      <div className="rounded-xl border border-border/80 bg-background/80 p-4 font-mono text-xs space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>pipeline_output.log</span>
          </div>
          <span className="text-primary font-bold">{progressPercent}%</span>
        </div>

        <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
          <div className="text-emerald-400">&gt; [INFO] CourseID: {courseId}</div>
          <div className="text-emerald-400">&gt; [STAGE] {currentStage.toUpperCase()}</div>
          <div className="text-foreground">
            &gt; {event?.message || "Curriculum Designer running..."}
          </div>
          {currentStage === "done" && (
            <div className="text-primary font-bold animate-pulse">
              &gt; [SUCCESS] Course generation completed! Redirecting to curation board...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
