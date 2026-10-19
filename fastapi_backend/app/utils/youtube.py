import re
from typing import Optional

def extract_youtube_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats."""
    pattern = r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})"
    match = re.search(pattern, url)
    return match.group(1) if match else None

def format_duration_seconds(seconds: int) -> str:
    """Format duration in seconds to MM:SS or HH:MM:SS."""
    if not seconds:
        return "0m"
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"
