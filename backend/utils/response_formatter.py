"""Consistent API envelope and error response formatters."""

from typing import Any, Dict, Optional


def success_response(data: Any, message: str = "Success", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Wraps response in standardized API structure."""
    res = {
        "status": "success",
        "message": message,
        "data": data,
    }
    if metadata:
        res["metadata"] = metadata
    return res


def error_response(message: str, code: int = 400, details: Optional[Any] = None) -> Dict[str, Any]:
    """Formats uniform error payload."""
    return {
        "status": "error",
        "code": code,
        "message": message,
        "details": details,
    }
