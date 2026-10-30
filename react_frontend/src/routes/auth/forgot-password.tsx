import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email: values.email });
      setSentEmail(values.email);
      setResetSent(true);
      if (response.data?.reset_url) {
        setDevResetUrl(response.data.reset_url);
      }
      toast.success("Password reset instructions generated! ✉️");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to process password reset request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (devResetUrl) {
      navigator.clipboard.writeText(devResetUrl);
      toast.success("Reset link copied to clipboard! 📋");
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12">
      <FloatingOrbs />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size={42} className="justify-center" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Reset Your Password
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter the email address linked to your CourseForge account.
          </p>
        </div>

        <div className="card-base p-8 shadow-glow">
          {resetSent ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground font-display">
                  Instructions Generated
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We've prepared password reset instructions for{" "}
                  <span className="font-semibold text-foreground">{sentEmail}</span>.
                </p>
              </div>

              {devResetUrl && (
                <div className="p-4 rounded-xl bg-primary-950/40 border border-primary/30 text-left space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="w-4 h-4" /> Direct Reset Link (Ready to Use)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Click below to open the password reset form directly with your secure token:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => {
                        const url = new URL(devResetUrl);
                        navigate(`${url.pathname}${url.search}`);
                      }}
                      className="text-xs h-9 font-bold flex-1"
                    >
                      Reset Password Now <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="btn-outline text-xs h-9 px-3 flex items-center justify-center gap-1.5 border-border/60 hover:border-primary/40"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setDevResetUrl(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Try another email
                </button>
                <Link
                  to="/auth/login"
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Account Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="architect@domain.dev"
                    error={!!errors.email}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? (
                  "Generating link..."
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="mt-4 pt-4 border-t border-border/40 text-center">
                <Link
                  to="/auth/login"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
