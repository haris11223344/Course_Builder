export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner", description: "Zero to foundational concepts" },
  { value: "intermediate", label: "Intermediate", description: "Practical architecture & deep dive" },
  { value: "advanced", label: "Advanced", description: "Production scaling & internals" },
];

export const SOURCE_OPTIONS = [
  { id: "youtube", label: "YouTube Videos", description: "Curated high-signal tutorials and deep dives", default: true },
  { id: "web", label: "Web Articles & Specs", description: "Industry documentation, MDN, DevDocs", default: true },
  { id: "github", label: "GitHub Repositories", description: "Reference architectures, real production code", default: true },
  { id: "doc", label: "Official Docs", description: "Language books and official reference guides", default: false },
];
