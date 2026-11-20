"""Pydantic schemas for password generation and analysis."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PasswordGenerateRequest(BaseModel):
    length: int = Field(default=16, ge=8, le=64, description="Target password length (8-64)")
    uppercase: bool = Field(default=True, description="Include uppercase letters A-Z")
    lowercase: bool = Field(default=True, description="Include lowercase letters a-z")
    numbers: bool = Field(default=True, description="Include digits 0-9")
    symbols: bool = Field(default=True, description="Include special characters")
    count: int = Field(default=1, ge=1, le=10, description="Number of passwords to generate (1-10)")


class PasswordAnalyzeRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=256, description="Password to evaluate")


class BinaryConversionRequest(BaseModel):
    binary_string: Optional[str] = Field(default=None, description="Binary stream to convert; generates fresh quantum bits if empty")
    bit_count: int = Field(default=64, ge=8, le=1024, description="Number of bits to convert if generating")
    encoding_mode: str = Field(default="binary", description="Encoding representation: binary, decimal, hex, ascii")
    chunk_size: int = Field(default=6, ge=2, le=16, description="Chunk bit size for integer candidate mapping")


class ComparisonRequest(BaseModel):
    password_length: int = Field(default=16, ge=8, le=64)
    iterations: int = Field(default=5, ge=1, le=20, description="Benchmark trial iterations")
    uppercase: bool = True
    lowercase: bool = True
    numbers: bool = True
    symbols: bool = True
