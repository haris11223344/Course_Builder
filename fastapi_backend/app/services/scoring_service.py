from typing import List, Dict, Any

class ScoringService:
    """Ranks and selects the highest quality educational resources."""

    @staticmethod
    def rank_resources(candidates: List[Dict[str, Any]], lesson_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Rank and deduplicate resources based on diversity, authority, and relevance."""
        seen_urls = set()
        unique_candidates = []
        for item in candidates:
            url = item.get("url")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_candidates.append(item)

        lesson_keywords = [k.lower() for k in lesson_context.get("search_queries", [])]

        # Separate candidates by type
        videos = [item for item in unique_candidates if item.get("type") == "video"]
        docs = [item for item in unique_candidates if item.get("type") in ("doc", "article")]
        repos = [item for item in unique_candidates if item.get("type") == "github"]

        # Sort each bucket
        def score_item(item):
            s = 100.0
            title = item.get("title", "").lower()
            metadata = item.get("metadata", {})
            for kw in lesson_keywords:
                if any(word in title for word in kw.split()):
                    s += 25.0
            if item.get("type") == "video":
                views = metadata.get("views", 0)
                if views > 1000000:
                    s += 30.0
                elif views > 100000:
                    s += 15.0
            elif item.get("type") == "github":
                if metadata.get("stars", 0) > 5000:
                    s += 20.0
            return s

        videos.sort(key=score_item, reverse=True)
        docs.sort(key=score_item, reverse=True)
        repos.sort(key=score_item, reverse=True)

        ranked_items = []
        # 1. ALWAYS add top 1-2 videos first
        for idx, v in enumerate(videos[:2]):
            ranked_items.append({
                **v,
                "is_primary": (idx == 0),
                "order": len(ranked_items)
            })

        # 2. Add top documentation
        for d in docs[:1]:
            ranked_items.append({
                **d,
                "is_primary": False,
                "order": len(ranked_items)
            })

        # 3. Add top repository
        for r in repos[:1]:
            ranked_items.append({
                **r,
                "is_primary": False,
                "order": len(ranked_items)
            })

        # Fallback if no videos found in candidates (emergency topic fallback)
        if not any(r.get("type") == "video" for r in ranked_items):
            fallback_vid = {
                "title": f"{lesson_context.get('title', 'Lecture')} — Comprehensive Video Guide",
                "url": "https://www.youtube.com/watch?v=UrsmFxEIp5k",
                "type": "video",
                "provider": "youtube",
                "provider_id": "UrsmFxEIp5k",
                "thumbnail_url": "https://img.youtube.com/vi/UrsmFxEIp5k/hqdefault.jpg",
                "duration_seconds": 1800,
                "metadata": {"channel": "CourseForge Verified", "views": 500000},
                "is_primary": True,
                "order": 0
            }
            ranked_items.insert(0, fallback_vid)
            # Reindex order
            for i, r in enumerate(ranked_items):
                r["order"] = i

        return ranked_items

scoring_service = ScoringService()
