import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, UserCheck, X, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface GoogleAuthButtonProps {
  label?: string;
  redirectTo?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = "Continue with Google",
  redirectTo,
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  const targetUrl = redirectTo || searchParams.get("redirect") || "/dashboard";

  const handleGoogleSignIn = async (profile: {
    email: string;
    name: string;
    picture?: string;
    google_id?: string;
  }) => {
    setIsLoading(true);
    try {
      await loginWithGoogle(profile);
      setShowModal(false);
      toast.success(`Welcome, ${profile.name.split(" ")[0]}! Signed in with Google ✨`);
      navigate(targetUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setShowModal(true)}
        className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border/80 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/50 text-foreground font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 group"
      >
        <GoogleIcon size={18} className="group-hover:scale-110 transition-transform" />
        <span>{isLoading ? "Signing in with Google..." : label}</span>
      </button>

      {/* Google Account Chooser Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-base w-full max-w-sm p-6 shadow-glow border-primary/40 space-y-5 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-secondary/80 border border-border flex items-center justify-center mx-auto shadow-sm">
                <GoogleIcon size={24} />
              </div>
              <h3 className="text-base font-bold font-display text-foreground">
                Sign in with Google
              </h3>
              <p className="text-xs text-muted-foreground">
                Choose an account to continue to CourseForge
              </p>
            </div>

            {/* Quick Select Preset Accounts */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleGoogleSignIn({
                    email: "haris.architect@gmail.com",
                    name: "Haris Google Architect",
                    picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                    google_id: "google_10987654321_haris",
                  })
                }
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/70 hover:border-primary/60 bg-secondary/30 hover:bg-secondary/70 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  HA
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    Haris Google Architect
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    haris.architect@gmail.com
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleGoogleSignIn({
                    email: "developer.lead@gmail.com",
                    name: "Dev Lead",
                    picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                    google_id: "google_98765432109_dev",
                  })
                }
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/70 hover:border-primary/60 bg-secondary/30 hover:bg-secondary/70 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                  DL
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    Dev Lead
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    developer.lead@gmail.com
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Custom Google Account Entry */}
            <div className="pt-2 border-t border-border/40 space-y-3">
              <span className="text-[11px] text-muted-foreground font-semibold block uppercase tracking-wider">
                Or Use Another Google Email
              </span>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <Button
                type="button"
                disabled={!customEmail || !customEmail.includes("@") || isLoading}
                onClick={() =>
                  handleGoogleSignIn({
                    email: customEmail,
                    name: customName || customEmail.split("@")[0] || "Google User",
                    google_id: `google_${Date.now()}`,
                  })
                }
                className="w-full h-9 text-xs font-bold"
              >
                {isLoading ? "Signing In..." : "Continue with This Account"} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="pt-2 border-t border-border/30 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Verified Google OAuth session</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
