import React, { useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ArrowRight, CheckCircle2, Github, Twitter, Youtube } from "lucide-react";
import { toast } from "sonner";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing to CourseForge releases! 🌿");
    setEmail("");
  };

  return (
    <footer className="relative mt-20 border-t border-border/60 bg-card/30 backdrop-blur-md">
      {/* Top Gradient Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Curate structured, mastery-driven learning journeys from the world’s best YouTube videos and web documentation.
              Engineered with zero jank and neon precision.
            </p>
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-secondary">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-secondary">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-secondary">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Curated Catalog</a></li>
              <li><a href="/builder" className="hover:text-primary transition-colors">AI Syllabus Generator</a></li>
              <li><a href="/library" className="hover:text-primary transition-colors">Saved Knowledge</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">Architecture Pipeline</a></li>
            </ul>
          </div>

          {/* Newsletter with focus-visible ring */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Stay Ahead</h4>
            <p className="text-xs text-muted-foreground">
              Weekly AI-curated developer paths and learning framework releases.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <CheckCircle2 className="w-4 h-4" /> You're on the list!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architect@domain.dev"
                  className="input-field pr-10 text-xs py-2 focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} CourseForge Inc. Production-grade educational intelligence.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <span className="flex items-center gap-1 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
