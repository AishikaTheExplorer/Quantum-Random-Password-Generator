"""Character set mapping and candidate extraction."""

import string
from typing import Dict, List, Set, Tuple


class CharacterMap:
    """Manages character sets and category allocations."""

    UPPERCASE = string.ascii_uppercase  # 26 chars
    LOWERCASE = string.ascii_lowercase  # 26 chars
    NUMBERS = string.digits              # 10 chars
    SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"  # 26 chars

    @classmethod
    def build_character_pool(
        cls,
        include_upper: bool = True,
        include_lower: bool = True,
        include_numbers: bool = True,
        include_symbols: bool = True,
    ) -> Tuple[str, Dict[str, str]]:
        """
        Builds the unified allowed character pool and returns the pool string
        along with category member mappings.
        """
        pool = ""
        categories: Dict[str, str] = {}

        if include_upper:
            categories["uppercase"] = cls.UPPERCASE
            pool += cls.UPPERCASE
        if include_lower:
            categories["lowercase"] = cls.LOWERCASE
            pool += cls.LOWERCASE
        if include_numbers:
            categories["numbers"] = cls.NUMBERS
            pool += cls.NUMBERS
        if include_symbols:
            categories["symbols"] = cls.SYMBOLS
            pool += cls.SYMBOLS

        if not pool:
            raise ValueError("At least one character category must be selected.")

        return pool, categories

    @classmethod
    def get_category_of_char(cls, char: str) -> str:
        """Determines the category of a given single character."""
        if char in cls.UPPERCASE:
            return "uppercase"
        if char in cls.LOWERCASE:
            return "lowercase"
        if char in cls.NUMBERS:
            return "numbers"
        if char in cls.SYMBOLS:
            return "symbols"
        return "other"
