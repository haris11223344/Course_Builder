from typing import Dict, Any
from app.models import Course

class ExportService:
    @staticmethod
    def to_markdown(course: Course) -> str:
        md = [f"# {course.title}\n"]
        if course.description:
            md.append(f"_{course.description}_\n")
        md.append(f"- **Difficulty**: {course.difficulty.value.title()}")
        md.append(f"- **Estimated Hours**: {course.estimated_hours or 'N/A'}")
        md.append(f"- **Tags**: {', '.join(course.tags or [])}\n")
        md.append("---\n")

        for m_idx, mod in enumerate(course.modules, 1):
            md.append(f"## Module {m_idx}: {mod.title}")
            if mod.description:
                md.append(f"{mod.description}\n")

            for l_idx, lesson in enumerate(mod.lessons, 1):
                md.append(f"### {m_idx}.{l_idx} {lesson.title}")
                if lesson.description:
                    md.append(f"{lesson.description}\n")

                if lesson.resources:
                    md.append("**Curated Resources:**")
                    for res in lesson.resources:
                        badge = "⭐ Primary" if res.is_primary else res.type.value.title()
                        md.append(f"- [{res.title}]({res.url}) ({badge})")
                    md.append("")
        return "\n".join(md)

export_service = ExportService()
