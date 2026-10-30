import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/validations";
import { useAuth } from "@/components/providers/AuthProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values);
      toast.success("Welcome back! ✨");
      navigate(redirectUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12">
      <FloatingOrbs />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size={42} className="justify-center" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Sign in to CourseForge
          </h1>
          <p className="text-xs text-muted-foreground">
            Access your curated courses, progress trackers, and saved resources.
          </p>
        </div>

        <div className="card-base p-8 shadow-glow space-y-5">
          {/* Sign In with Google Option */}
          <GoogleAuthButton label="Sign in with Google" />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/60 w-full" />
            <span className="bg-card px-3 text-[11px] text-muted-foreground uppercase tracking-wider relative shrink-0">
              or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
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

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth/forgot-password" className="text-[11px] text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/40 text-center space-y-3">
            <button
              onClick={() => {
                // Demo guest fast login
                login({ email: "tester_forge@example.com", password: "StrongPassword123!" })
                  .then(() => {
                    toast.success("Logged in with Demo Architect credentials!");
                    navigate("/dashboard");
                  })
                  .catch(() => {
                    toast.info("Register a new account or sign in with your email.");
                  });
              }}
              className="btn-outline w-full text-xs h-9 text-primary border-primary/30"
            >
              <Sparkles className="w-3.5 h-3.5" /> Quick Demo Login
            </button>

            <p className="text-xs text-muted-foreground">
              Don't have an account yet?{" "}
              <Link to="/auth/register" className="text-primary font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
