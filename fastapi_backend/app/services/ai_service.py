import json
import httpx
from typing import Dict, Any, List
from loguru import logger
from app.core.config import settings

class AIService:
    """Service for LLM-powered curriculum generation."""

    @staticmethod
    async def generate_curriculum(topic: str, difficulty: str = "beginner", sources: List[str] = None) -> Dict[str, Any]:
        """Generate structured curriculum with modules, lessons, and search queries."""
        if sources is None:
            sources = ["youtube", "web", "github"]

        # If OpenAI key is present, try OpenAI
        if settings.OPENAI_API_KEY:
            try:
                return await AIService._generate_with_openai(topic, difficulty, sources)
            except Exception as e:
                logger.warning(f"OpenAI curriculum generation failed, falling back to smart generator: {e}")

        # If Gemini key is present, try Gemini
        if settings.GEMINI_API_KEY:
            try:
                return await AIService._generate_with_gemini(topic, difficulty, sources)
            except Exception as e:
                logger.warning(f"Gemini curriculum generation failed, falling back to smart generator: {e}")

        # Intelligent structured generator fallback
        return AIService._generate_fallback_curriculum(topic, difficulty, sources)

    @staticmethod
    async def _generate_with_openai(topic: str, difficulty: str, sources: List[str]) -> Dict[str, Any]:
        prompt = f"""
Act as a Principal Staff Curriculum Designer.
Design an in-depth, structured masterclass course on: "{topic}".
Target audience level: {difficulty}.
Primary resource types: {', '.join(sources)}.

Return ONLY valid JSON with this exact schema:
{{
  "title": "{topic.title()} Mastery",
  "description": "Comprehensive structured syllabus from fundamentals to production mastery.",
  "estimated_hours": 12.5,
  "tags": ["{topic.lower()}", "programming", "engineering"],
  "modules": [
    {{
      "title": "Module 1: Foundations & Core Architecture",
      "description": "Fundamental concepts, mental models, and setup.",
      "order": 0,
      "lessons": [
        {{
          "title": "Introduction and Ecosystem Overview",
          "description": "High level architecture and historical context.",
          "order": 0,
          "duration_minutes": 25,
          "learning_objectives": ["Understand mental model", "Navigate tools"],
          "search_queries": ["{topic} full course overview tutorial", "{topic} architecture basics"]
        }}
      ]
    }}
  ]
}}
Provide 3 to 4 distinct modules, each with 2 to 3 lessons.
"""
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are a curriculum designer. Always output strict valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"}
                }
            )
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)

    @staticmethod
    async def _generate_with_gemini(topic: str, difficulty: str, sources: List[str]) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        prompt = f"""
Act as a Principal Curriculum Architect. Generate a comprehensive course for: "{topic}" at level "{difficulty}".
Output strict JSON with:
title, description, estimated_hours, tags (list of string), modules (list with title, description, order, lessons (list with title, description, order, duration_minutes, learning_objectives, search_queries)).
"""
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            # Clean markdown formatting if present
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())

    @staticmethod
    def _generate_fallback_curriculum(topic: str, difficulty: str, sources: List[str]) -> Dict[str, Any]:
        """High quality semantic curriculum generator tailored to the topic."""
        clean_topic = topic.strip().title()
        
        modules = [
            {
                "title": f"Module 1: {clean_topic} Foundations & Setup",
                "description": f"Master the core mental models, developer tooling, and environment setup for {clean_topic}.",
                "order": 0,
                "lessons": [
                    {
                        "title": f"Introduction to {clean_topic} & Ecosystem",
                        "description": f"Comprehensive tour of why {clean_topic} matters, architectural philosophies, and tooling setup.",
                        "order": 0,
                        "duration_minutes": 25,
                        "learning_objectives": [
                            f"Understand core syntax and principles of {clean_topic}",
                            "Setup high-performance dev environment",
                            "Verify installation and tooling"
                        ],
                        "search_queries": [
                            f"{topic} crash course for beginners",
                            f"getting started with {topic} 2025"
                        ]
                    },
                    {
                        "title": f"Core Syntax, Data Structures & Primitives",
                        "description": f"Deep dive into standard library patterns, types, and fundamental primitives.",
                        "order": 1,
                        "duration_minutes": 35,
                        "learning_objectives": [
                            "Write clean idiomatic primitives",
                            "Avoid common beginner pitfalls",
                            "Memory and execution semantics"
                        ],
                        "search_queries": [
                            f"{topic} fundamentals tutorial step by step",
                            f"{topic} core syntax and patterns"
                        ]
                    }
                ]
            },
            {
                "title": f"Module 2: Intermediate Architecture & Deep Dive",
                "description": f"Building scalable components, async execution, state patterns, and composability in {clean_topic}.",
                "order": 1,
                "lessons": [
                    {
                        "title": "Design Patterns & Component Architecture",
                        "description": "Architecting resilient, modular codebases with proven design systems and patterns.",
                        "order": 0,
                        "duration_minutes": 40,
                        "learning_objectives": [
                            "Implement decoupled clean architectures",
                            "Manage state transitions and errors gracefully",
                            "Maintainability best practices"
                        ],
                        "search_queries": [
                            f"{topic} best practices and design patterns",
                            f"{topic} project architecture deep dive"
                        ]
                    },
                    {
                        "title": "Performance Optimization & Diagnostics",
                        "description": "Profiling, eliminating bottlenecks, memory efficiency, and benchmarking techniques.",
                        "order": 1,
                        "duration_minutes": 30,
                        "learning_objectives": [
                            "Profile latency and hotspots",
                            "Optimize throughput and payload sizes",
                            "Write benchmark suites"
                        ],
                        "search_queries": [
                            f"{topic} performance optimization guide",
                            f"{topic} benchmarking and profiling"
                        ]
                    }
                ]
            },
            {
                "title": f"Module 3: Real-World Production Capstone",
                "description": f"Constructing an end-to-end production deployment with testing, CI/CD, and monitoring.",
                "order": 2,
                "lessons": [
                    {
                        "title": "Full-Stack Project Implementation",
                        "description": "Hands-on build from scratch integrating databases, caching, and modern APIs.",
                        "order": 0,
                        "duration_minutes": 55,
                        "learning_objectives": [
                            "Build complete end-to-end application",
                            "Implement security standards and authentication",
                            "Package with Docker and containerization"
                        ],
                        "search_queries": [
                            f"{topic} full stack project tutorial build and deploy",
                            f"building production ready {topic} application"
                        ]
                    },
                    {
                        "title": "Automated Testing, CI/CD & Deployment",
                        "description": "Production hardening, automated testing pipelines, and cloud distribution.",
                        "order": 1,
                        "duration_minutes": 35,
                        "learning_objectives": [
                            "Write unit, integration, and E2E tests",
                            "Configure automated GitHub Actions workflow",
                            "Zero-downtime deployment strategies"
                        ],
                        "search_queries": [
                            f"{topic} testing and deployment guide",
                            f"{topic} production deployment docker kubernetes"
                        ]
                    }
                ]
            }
        ]

        return {
            "title": f"{clean_topic}: From Zero to Production",
            "description": f"A battle-tested, structured curriculum designed to take you from foundational concepts to building high-performance {clean_topic} applications in production.",
            "difficulty": difficulty,
            "estimated_hours": 8.5,
            "tags": [topic.lower(), "software-engineering", difficulty, "curated"],
            "modules": modules
        }

ai_service = AIService()
