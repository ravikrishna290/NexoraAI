"""
Rate Limiting & Security Middleware for FastAPI.
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from backend.utils.redis_manager import redis_manager
from backend.utils.logger import logger

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"

        # Bypass rate limit for static files or open docs
        if request.url.path in ["/healthz", "/readyz", "/metrics", "/docs", "/openapi.json"]:
            return await call_next(request)

        allowed = await redis_manager.check_rate_limit(client_ip, max_requests=120, window_seconds=60)
        if not allowed:
            logger.warning(f"[Security] Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Maximum 120 requests per minute allowed."
            )

        response = await call_next(request)
        # Security headers (OWASP best practices)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
