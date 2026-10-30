import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { Lock, ArrowRight, CheckCircle2, AlertTriangle, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setTokenValid(false);
        setErrorMessage("Password reset token is missing from the URL.");
        return;
      }

      try {
        const response = await api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        if (response.data.valid) {
          setTokenValid(true);
          setTokenEmail(response.data.email);
        } else {
          setTokenValid(false);
          setErrorMessage(response.data.message || "This password reset link is invalid or expired.");
        }
      } catch (err: any) {
        setTokenValid(false);
        setErrorMessage(
          err.response?.data?.detail || "Unable to verify password reset token. It may have expired."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: values.password,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully! ✨");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2500);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12">
      <FloatingOrbs />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size={42} className="justify-center" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Set New Password
          </h1>
          <p className="text-xs text-muted-foreground">
            {tokenEmail
              ? `Creating a new secure password for ${tokenEmail}`
              : "Choose a new strong password for your CourseForge account."}
          </p>
        </div>

        <div className="card-base p-8 shadow-glow">
          {isVerifying ? (
            <div className="space-y-4 text-center py-6">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Verifying security token...</p>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto text-destructive">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground font-display">
                  Invalid or Expired Token
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {errorMessage || "This password reset link is invalid, already used, or expired."}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => navigate("/auth/forgot-password")}
                  className="w-full text-xs h-10 font-bold"
                >
                  Request a New Link <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="pt-4 border-t border-border/40">
                <Link
                  to="/auth/login"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground font-display">
                  Password Updated!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your password has been reset successfully. Redirecting you to sign in...
                </p>
              </div>

              <Button
                onClick={() => navigate("/auth/login")}
                className="w-full text-xs h-10 font-bold"
              >
                Sign In Now <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    error={!!errors.password}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    error={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2"
              >
                {isSubmitting ? (
                  "Updating Password..."
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Save New Password
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
