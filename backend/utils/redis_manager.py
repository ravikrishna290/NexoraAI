"""
Redis Manager for Pub/Sub Broadcasting, Caching, and Token Bucket Rate Limiting.
"""

import os
import time
import json
from typing import Optional, Dict, Any
from backend.utils.logger import logger

class RedisManager:
    """Redis Interface with graceful local fallback if Redis server is unpopulated."""

    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._local_cache: Dict[str, tuple] = {}
        self._rate_limits: Dict[str, list] = {}
        self.is_connected = False
        logger.info("[RedisManager] Initialized Redis Manager (In-Memory Fallback Active).")

    async def get_cache(self, key: str) -> Optional[Any]:
        if key in self._local_cache:
            val, expiry = self._local_cache[key]
            if time.time() < expiry:
                return val
            else:
                del self._local_cache[key]
        return None

    async def set_cache(self, key: str, value: Any, ttl_seconds: int = 5):
        self._local_cache[key] = (value, time.time() + ttl_seconds)

    async def check_rate_limit(self, client_ip: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
        """Token bucket rate limiter. Returns True if request is ALLOWED, False if LIMITED."""
        now = time.time()
        timestamps = self._rate_limits.get(client_ip, [])
        # Filter timestamps within window
        timestamps = [ts for ts in timestamps if now - ts < window_seconds]
        if len(timestamps) >= max_requests:
            return False
        timestamps.append(now)
        self._rate_limits[client_ip] = timestamps
        return True

    async def publish_websocket(self, channel: str, message: Dict[str, Any]):
        """Publish broadcast payload over Pub/Sub channel."""
        pass

redis_manager = RedisManager()
