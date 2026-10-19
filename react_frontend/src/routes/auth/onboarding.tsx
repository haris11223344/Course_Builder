import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  GraduationCap,
  Layers,
  Clock,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export const OnboardingPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    learningGoals: ["Master Full Stack Architecture"],
    preferredDifficulty: "intermediate",
    preferredSources: ["youtube", "web", "github"],
    weeklyHours: 8,
  });

  const goalsList = [
    "Master Full Stack Architecture",
    "Systems Programming & Rust",
    "AI / LLM Engineering & RAG",
    "Cloud Native & DevOps Kubernetes",
    "High-Performance Frontend Systems",
    "Cybersecurity & Reverse Engineering",
  ];

  const difficulties = [
    { id: "beginner", title: "Beginner", desc: "First time learning or rebuilding foundations" },
    { id: "intermediate", title: "Intermediate", desc: "Solid developer wanting production deep dives" },
    { id: "advanced", title: "Advanced", desc: "Staff/Principal level internals and scaling" },
  ];

  const sourceTypes = [
    { id: "youtube", label: "YouTube Deep Dives", desc: "Visual breakdowns and code tutorials" },
    { id: "web", label: "Documentation & Specs", desc: "Official language specifications and MDN" },
    { id: "github", label: "Open Source Code", desc: "Real production repositories and starters" },
    { id: "doc", label: "Reference Manuals", desc: "Standard libraries and architecture RFCs" },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post("/users/onboarding", {
        full_name: formData.fullName,
        learning_goals: formData.learningGoals,
        preferred_difficulty: formData.preferredDifficulty,
        preferred_sources: formData.preferredSources,
        weekly_hours: formData.weeklyHours,
      });
      updateUser(res.data);
      toast.success("Preferences saved! Welcome to CourseForge. 🚀");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12">
      <FloatingOrbs />

      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size={36} className="justify-center" />
          <h1 className="text-2xl font-bold font-display text-foreground">
            Personalize Your Engine
          </h1>
          <p className="text-xs text-muted-foreground">
            Step {currentStep + 1} of 4: Help AI curate the highest-signal content for you.
          </p>

          {/* Stepper Progress Bar */}
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-4">
            <motion.div
              className="h-full bg-primary glow"
              initial={{ width: "25%" }}
              animate={{ width: `${((currentStep + 1) / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="card-base p-8 shadow-glow-lg min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* Step 1: Goals */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground">What are your primary goals?</h3>
                  <p className="text-xs text-muted-foreground">Select what you intend to master this quarter.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {goalsList.map((goal) => {
                    const isSelected = formData.learningGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            learningGoals: isSelected
                              ? prev.learningGoals.filter((g) => g !== goal)
                              : [...prev.learningGoals, goal],
                          }));
                        }}
                        className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary glow-inner"
                            : "border-border/80 bg-background/50 hover:bg-secondary/60 text-muted-foreground"
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Difficulty */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground">Preferred Technical Difficulty</h3>
                  <p className="text-xs text-muted-foreground">Calibrate the depth of code examples and concepts.</p>
                </div>
                <div className="space-y-3">
                  {difficulties.map((diff) => {
                    const isSelected = formData.preferredDifficulty === diff.id;
                    return (
                      <div
                        key={diff.id}
                        onClick={() => setFormData({ ...formData, preferredDifficulty: diff.id })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground glow-inner"
                            : "border-border/80 bg-background/50 hover:bg-secondary/60 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-foreground">{diff.title}</h4>
                          {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{diff.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Source Priorities */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground">Content Sources</h3>
                  <p className="text-xs text-muted-foreground">Choose your favorite media types to prioritize.</p>
                </div>
                <div className="space-y-2.5">
                  {sourceTypes.map((src) => {
                    const isSelected = formData.preferredSources.includes(src.id);
                    return (
                      <div
                        key={src.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            preferredSources: isSelected
                              ? prev.preferredSources.filter((s) => s !== src.id)
                              : [...prev.preferredSources, src.id],
                          }));
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground glow-inner"
                            : "border-border/80 bg-background/50 hover:bg-secondary/60 text-muted-foreground"
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{src.label}</h4>
                          <p className="text-[11px] text-muted-foreground">{src.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 accent-primary rounded cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground">Weekly Dedication</h3>
                  <p className="text-xs text-muted-foreground">We calculate milestone pace based on your availability.</p>
                </div>
                <div className="space-y-4 text-center">
                  <span className="text-5xl font-extrabold font-display text-primary glow-inner">
                    {formData.weeklyHours} hrs
                  </span>
                  <p className="text-xs text-muted-foreground">per week dedicated to active study</p>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="1"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value) })}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>2 hrs (Casual)</span>
                    <span>10 hrs (Standard)</span>
                    <span>30 hrs (Bootcamp)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn-ghost text-xs px-3 h-9 disabled:opacity-30"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="text-xs h-9 px-5"
            >
              {currentStep === 3 ? (
                isSubmitting ? "Finalizing..." : "Complete Setup ✨"
              ) : (
                <>
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
