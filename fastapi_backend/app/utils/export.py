def generate_html_export(course_title: str, markdown_content: str) -> str:
    """Generate standalone styled HTML for course syllabus."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{course_title} - CourseForge Syllabus</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #0f172a;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }}
    h1, h2, h3 {{ color: #047857; }}
    a {{ color: #059669; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    code {{ background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }}
  </style>
</head>
<body>
  <pre>{markdown_content}</pre>
</body>
</html>"""
