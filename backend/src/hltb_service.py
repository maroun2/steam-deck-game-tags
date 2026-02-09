"""
HowLongToBeat Service
Integrates with HowLongToBeat to fetch game completion times
"""

import asyncio
from typing import Optional, Dict, Any, List
from howlongtobeatpy import HowLongToBeat

# Use Decky's built-in logger
import decky
logger = decky.logger


class HLTBService:
    def __init__(self):
        self.hltb = HowLongToBeat()
        self.min_similarity = 0.7  # Minimum similarity threshold

    async def search_game(self, game_name: str) -> Optional[Dict[str, Any]]:
        """Search HLTB for game completion times"""
        if not game_name or game_name.startswith("Unknown"):
            return None

        try:
            logger.debug(f"Searching HLTB for: {game_name}")

            # Use async search
            results = await self.hltb.async_search(game_name)

            if not results or len(results) == 0:
                logger.debug(f"No HLTB results found for: {game_name}")
                return None

            # Find best match by similarity
            best_match = max(results, key=lambda x: x.similarity)

            # Filter by minimum similarity
            if best_match.similarity < self.min_similarity:
                logger.debug(
                    f"Best match similarity too low ({best_match.similarity:.2f}): "
                    f"{best_match.game_name} for {game_name}"
                )
                return None

            logger.info(
                f"Found HLTB match: {best_match.game_name} "
                f"(similarity: {best_match.similarity:.2f})"
            )

            return {
                "game_name": game_name,
                "matched_name": best_match.game_name,
                "similarity": best_match.similarity,
                "main_story": best_match.main_story,
                "main_extra": best_match.main_extra,
                "completionist": best_match.completionist,
                "all_styles": best_match.all_styles,
                "hltb_url": best_match.game_web_link
            }

        except Exception as e:
            logger.error(f"HLTB search failed for {game_name}: {e}")
            return None

    async def bulk_fetch_games(
        self,
        game_list: List[Dict[str, str]],
        delay: float = 1.0,
        progress_callback=None
    ) -> Dict[str, Dict[str, Any]]:
        """Batch fetch multiple games with rate limiting"""
        results = {}
        total = len(game_list)

        for i, game in enumerate(game_list):
            appid = game.get("appid")
            game_name = game.get("name")

            if not appid or not game_name:
                continue

            result = await self.search_game(game_name)

            if result:
                results[appid] = result

            # Progress callback
            if progress_callback:
                progress_callback(i + 1, total)

            # Rate limiting delay
            if i < total - 1:  # Don't delay after last item
                await asyncio.sleep(delay)

        logger.info(f"Bulk fetch completed: {len(results)}/{total} games found")
        return results

    async def get_completion_time(
        self,
        appid: str,
        game_name: str,
        cache_lookup_func=None
    ) -> Optional[Dict[str, Any]]:
        """
        Get completion time for a game, checking cache first

        Args:
            appid: Steam app ID
            game_name: Game name
            cache_lookup_func: Optional async function to check cache
                              Should accept (appid) and return cached data or None
        """
        # Check cache if function provided
        if cache_lookup_func:
            cached_data = await cache_lookup_func(appid)
            if cached_data:
                logger.debug(f"Using cached HLTB data for {appid}")
                return cached_data

        # Fetch fresh data
        return await self.search_game(game_name)
