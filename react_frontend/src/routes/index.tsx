import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CanvasNeuralNet } from "@/components/background/CanvasNeuralNet";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Cpu,
  Search,
  CheckCircle,
  Flame,
  Award,
  ChevronDown,
  Compass,
  Video,
  FileCode,
  Github,
  Zap,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "step-1",
      title: "1. Specify Your Goal",
      tagline: "Natural Language Prompting",
      desc: "Type anything from 'Distributed Systems in Rust' to 'Advanced React Concurrency'. The AI parses requirements and generates a rigorous curriculum roadmap.",
      icon: Search,
    },
    {
      id: "step-2",
      title: "2. Autonomous Web & Video Mining",
      tagline: "Parallel Scrape & Diversity Check",
      desc: "Our engine scours millions of YouTube videos, GitHub repositories, and official specs, filtering out low-effort fluff and ensuring creator diversity.",
      icon: Cpu,
    },
    {
      id: "step-3",
      title: "3. Interactive Curation Board",
      tagline: "Drag-and-Drop Power",
      desc: "Reorder modules, swap lectures, customize primary resources, and tailor the syllabus to your exact schedule before you start.",
      icon: Layers,
    },
    {
      id: "step-4",
      title: "4. Distraction-Free Mastery Player",
      tagline: "60FPS Learning Mode",
      desc: "Watch embedded videos alongside synchronized markdown notes, keyboard hotkeys (J/K/M), and verifiable milestone completions.",
      icon: Zap,
    },
  ];

  const features = [
    {
      title: "Zero Fluff Curation",
      desc: "Scores view metrics, creator authority, and code quality so you only study industry-grade tutorials.",
      icon: Sparkles,
      tag: "Autonomous AI",
    },
    {
      title: "Multi-Source Knowledge",
      desc: "Combines 4K YouTube breakdowns with official DevDocs and production GitHub templates in one lesson.",
      icon: Layers,
      tag: "Hybrid Pipeline",
    },
    {
      title: "Instant Course Generation",
      desc: "Generates comprehensive 12-hour structured curriculums in under 45 seconds via streaming pipelines.",
      icon: Zap,
      tag: "Real-time SSE",
    },
    {
      title: "Verifiable Progression",
      desc: "Continuous watch-time logging, optimistic mark-complete checklists, and exportable Markdown syllabi.",
      icon: CheckCircle,
      tag: "Progress Ring",
    },
  ];

  const testimonials = [
    {
      name: "Alex Thorne",
      role: "Staff Engineer @ Stripe",
      quote: "CourseForge saved me 40 hours of finding non-clickbait tutorials when ramping up on WebAssembly.",
    },
    {
      name: "Elena Rostova",
      role: "Senior Frontend Lead",
      quote: "The curation board is brilliant. Finally, a structured course builder that looks and feels like Linear.",
    },
    {
      name: "Marcus Vance",
      role: "Founder & Architect",
      quote: "The best developer tool I've used this year. The YouTube ranking algorithm is insanely accurate.",
    },
    {
      name: "Sarah Chen",
      role: "Full Stack Engineer",
      quote: "The dark forest emerald aesthetics with the keyboard shortcuts make learning addictive.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Background Neural Canvas & Glow Orbs */}
      <CanvasNeuralNet />
      <FloatingOrbs />

      {/* =========================================================================
          HERO SECTION (FULL VIEWPORT HEIGHT)
         ========================================================================= */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-4 pt-12 pb-20 text-center sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mx-auto max-w-4xl space-y-8"
        >
          {/* Release Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary glow-inner">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              CourseForge 2.0 Engine Live • Next-Gen AI Learning
            </span>
          </motion.div>

          {/* Headline with Split Gradient Text */}
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Build Courses, <br />
            <span className="text-gradient-hero">Not Playlists.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            Describe any engineering goal. Our AI curriculum architect searches, ranks, and synthesizes the finest YouTube tutorials and documentation into a structured masterclass.
          </motion.p>

          {/* CTA Actions */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <MagneticButton
              onClick={() => navigate("/builder")}
              className="w-full sm:w-auto h-13 px-8 text-base shadow-glow-lg"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
              Generate Your First Course Free
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>

            <a
              href="#live-demo"
              className="btn-outline w-full sm:w-auto h-13 px-7 text-sm font-semibold"
            >
              <Play className="w-4 h-4 text-primary fill-primary" />
              View Interactive Demo
            </a>
          </motion.div>

          {/* Tech Stack Tags */}
          <motion.div
            variants={fadeInUp}
            className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Video className="w-4 h-4 text-primary" /> YouTube Data API v3
            </span>
            <span className="flex items-center gap-1.5">
              <Github className="w-4 h-4 text-primary" /> GitHub Repositories
            </span>
            <span className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-primary" /> Official DevDocs
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Semantic Ranking
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs text-muted-foreground cursor-pointer"
          onClick={() => {
            document.getElementById("live-demo")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <div className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="text-[10px] tracking-wider uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* =========================================================================
          LIVE DEMO PREVIEW (THE "SHOWSTOPPER" PREVIEW CARD)
         ========================================================================= */}
      <section id="live-demo" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Live Experience Preview</span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground font-display">
            The Distraction-Free Learning Cockpit
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Experience the harmony of video lessons, markdown references, and instant keyboard shortcuts.
          </p>
        </div>

        {/* Mock Player UI */}
        <div className="relative rounded-2xl border border-primary/30 bg-card/90 backdrop-blur-xl shadow-glow-xl overflow-hidden p-2 sm:p-4">
          <div className="flex items-center justify-between pb-3 px-2 border-b border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-foreground text-[11px]">courseforge://rust-for-webassembly/lesson-1</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> LIVE STREAM
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
            {/* Video mock player */}
            <div className="lg:col-span-2 relative aspect-video bg-primary-950/60 rounded-xl overflow-hidden border border-border group flex items-center justify-center">
              <img
                src="https://img.youtube.com/vi/zF34dRivLOw/maxresdefault.jpg"
                alt="Video Preview"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-glow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/60 backdrop-blur text-foreground">
                  Rust Crash Course for Beginners (Traversy Media)
                </span>
              </div>
            </div>

            {/* Curriculum Drawer Preview */}
            <div className="rounded-xl border border-border/80 bg-background/50 p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Module 1 Syllabus</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono">1/3 Done</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-primary/10 border-l-2 border-primary text-primary font-medium flex items-center justify-between">
                    <span>1.1 Introduction & Setup</span>
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="p-2.5 rounded-lg hover:bg-secondary/60 text-muted-foreground flex items-center justify-between">
                    <span>1.2 Memory Semantics & Ownership</span>
                    <Play className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="p-2.5 rounded-lg hover:bg-secondary/60 text-muted-foreground flex items-center justify-between">
                    <span>1.3 Structs, Enums & Traits</span>
                    <Play className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Hotkeys:</span>
                  <span className="font-mono text-primary">[J] Next • [M] Complete</span>
                </div>
                <button
                  onClick={() => navigate("/builder")}
                  className="btn-primary w-full text-xs h-9"
                >
                  Create Course Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (STEPPER TIMELINE WITH SHARED LAYOUTID)
         ========================================================================= */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Autonomous Architecture</span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground font-display">
            How CourseForge Orchestrates Mastery
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            From natural language prompt to a synchronized learning tree in four stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Vertical Stepper List */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-xl p-5 transition-all duration-300 relative border ${
                    isSelected
                      ? "border-primary/40 bg-card/90 shadow-glow"
                      : "border-border/60 bg-card/30 hover:bg-card/60"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="step-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary"
                    />
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {step.tagline}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-0.5">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper Active Visualizer */}
          <div className="rounded-2xl border border-primary/30 bg-card/70 backdrop-blur-xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[360px]">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Cpu className="w-48 h-48 text-primary" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 relative z-10"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/20 text-primary border border-primary/40 glow">
                  {React.createElement(steps[activeStep].icon, { className: "w-8 h-8" })}
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display text-foreground">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {steps[activeStep].desc}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 font-mono text-xs text-primary space-y-1">
                  <div>// Pipeline Stage status: READY</div>
                  <div>&gt; active_stage: "{steps[activeStep].tagline}"</div>
                  <div>&gt; latency: &lt;450ms (optimized stream)</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURES SECTION (HORIZONTAL GRID WITH GLOW)
         ========================================================================= */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Core Advantages</span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground font-display">
            Engineered for Serious Learners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="card-base group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 180, scale: 1.2 }}
                      transition={{ duration: 0.4 }}
                      className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/30"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          INFINITE TESTIMONIALS CAROUSEL
         ========================================================================= */}
      <section className="relative py-20 border-t border-border/40 overflow-hidden bg-card/20">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Industry Feedback</span>
          <h2 className="text-2xl font-bold text-foreground">Loved by Staff Engineers & Learners</h2>
        </div>

        {/* Marquee Carousel */}
        <div className="flex gap-6 w-max animate-shimmer hover:[animation-play-state:paused] px-4">
          {[...testimonials, ...testimonials].map((item, idx) => (
            <div
              key={idx}
              className="w-80 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md p-5 flex flex-col justify-between shadow-card"
            >
              <p className="text-xs text-muted-foreground italic mb-4 leading-relaxed">
                "{item.quote}"
              </p>
              <div>
                <h4 className="text-xs font-bold text-foreground">{item.name}</h4>
                <p className="text-[11px] text-primary">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA
         ========================================================================= */}
      <section className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/40 bg-gradient-to-b from-card to-background p-10 sm:p-14 shadow-glow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground mb-4">
            Ready to master your next technology?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8">
            Create an account or start immediately. Free unlimited courses with AI YouTube curation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <MagneticButton
              onClick={() => navigate("/builder")}
              className="h-12 px-8 text-sm"
            >
              <Sparkles className="w-4 h-4" /> Start Course Generator
            </MagneticButton>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-outline h-12 px-6 text-sm"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
