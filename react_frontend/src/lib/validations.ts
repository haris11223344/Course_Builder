import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const topicInputSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(120, "Topic too long"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedHours: z.number().min(1).max(100).default(10),
});

export type TopicInputFormValues = z.infer<typeof topicInputSchema>;

export const sourceSelectionSchema = z.object({
  sources: z.array(z.string()).min(1, "Select at least one resource source"),
});

export type SourceSelectionFormValues = z.infer<typeof sourceSelectionSchema>;

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  learningGoals: z.array(z.string()).min(1, "Select at least one learning goal"),
  preferredDifficulty: z.enum(["beginner", "intermediate", "advanced"]),
  preferredSources: z.array(z.string()).min(1, "Choose preferred sources"),
  weeklyHours: z.number().min(1).max(40),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
