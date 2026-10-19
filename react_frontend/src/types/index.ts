export type UserRole = "user" | "admin";
export type Provider = "email" | "google";
export type CourseStatus = "draft" | "generating" | "ready" | "failed";
export type ResourceType = "video" | "article" | "doc" | "github" | "other";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  provider: Provider;
  is_verified: boolean;
  onboarding_completed: boolean;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  lesson_id: string;
  type: ResourceType;
  title: string;
  url: string;
  thumbnail_url?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  duration_seconds?: number | null;
  metadata_?: Record<string, unknown>;
  order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  order: number;
  duration_minutes?: number | null;
  resources: Resource[];
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: Lesson[];
  created_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  status: CourseStatus;
  difficulty: Difficulty;
  estimated_hours?: number | null;
  tags: string[];
  curriculum_snapshot: Record<string, unknown>;
  is_public: boolean;
  share_slug?: string | null;
  modules: Module[];
  created_at: string;
  updated_at: string;
}

export interface CourseListResponse {
  items: Course[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  watch_time_seconds: number;
  completed_at?: string | null;
  updated_at: string;
}

export interface CourseStats {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  in_progress_lessons: number;
  percent_completed: number;
  total_watch_time_seconds: number;
}

export interface SavedResource {
  id: string;
  user_id: string;
  resource_id: string;
  personal_note?: string | null;
  tags: string[];
  created_at: string;
  resource?: Resource;
}

export interface SavedResourceListResponse {
  items: SavedResource[];
  total: number;
  page: number;
  page_size: number;
}

export interface GenerationEvent {
  course_id: string;
  stage: "planning" | "searching" | "ranking" | "saving" | "done" | "failed";
  progress: number;
  message: string;
  payload?: unknown;
}
