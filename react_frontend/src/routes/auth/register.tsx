import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/lib/validations";
import { useAuth } from "@/components/providers/AuthProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerAuth({
        email: values.email,
        password: values.password,
        full_name: values.fullName,
      });
      toast.success("Account created successfully! Welcome to CourseForge.");
      navigate("/auth/onboarding");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed. Please check inputs.");
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
            Start Learning with AI
          </h1>
          <p className="text-xs text-muted-foreground">
            Generate customized courses, track mastery, and build projects.
          </p>
        </div>

        <div className="card-base p-8 shadow-glow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ada Lovelace"
                error={!!errors.fullName}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="ada@domain.dev"
                error={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password (8+ characters)</Label>
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

            <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
              <span className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" /> Dark mode 60fps experience guaranteed
              </span>
              <span className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" /> Free unlimited AI course generation
              </span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
