"""Password strength analyzer and security assessment engine."""

from typing import Dict, Any, List
from password_engine.character_mapping import CharacterMap
from password_engine.entropy import EntropyEngine


class PasswordStrengthAnalyzer:
    """
    Evaluates password robustness, character category diversity,
    effective character pool size, and attack survivability.
    """

    @classmethod
    def analyze_password(cls, password: str) -> Dict[str, Any]:
        """Performs multi-vector cryptographic assessment on the supplied password string."""
        length = len(password)
        if length == 0:
            return {
                "length": 0,
                "character_categories": {},
                "character_set_size": 0,
                "theoretical_entropy_bits": 0.0,
                "strength": EntropyEngine.classify_strength(0.0),
                "crack_time_estimates": EntropyEngine.estimate_crack_times(0.0),
                "search_space": EntropyEngine.format_search_space(0, 0),
                "character_breakdown": [],
                "recommendations": ["Password cannot be empty."],
            }

        # Determine categories present
        has_upper = any(c in CharacterMap.UPPERCASE for c in password)
        has_lower = any(c in CharacterMap.LOWERCASE for c in password)
        has_numbers = any(c in CharacterMap.NUMBERS for c in password)
        has_symbols = any(c in CharacterMap.SYMBOLS for c in password)
        has_other = any(c not in (CharacterMap.UPPERCASE + CharacterMap.LOWERCASE + CharacterMap.NUMBERS + CharacterMap.SYMBOLS) for c in password)

        # Calculate effective character set size N_eff based on available keyspace
        # of the types of characters utilized
        pool_size = 0
        if has_upper:
            pool_size += len(CharacterMap.UPPERCASE)
        if has_lower:
            pool_size += len(CharacterMap.LOWERCASE)
        if has_numbers:
            pool_size += len(CharacterMap.NUMBERS)
        if has_symbols:
            pool_size += len(CharacterMap.SYMBOLS)
        if has_other:
            pool_size += 32  # Standard extended ASCII / unicode slice approximation

        # Calculate theoretical entropy H = L * log2(N_eff)
        entropy_bits = EntropyEngine.calculate_theoretical_entropy(length, pool_size)
        strength = EntropyEngine.classify_strength(entropy_bits)
        search_space = EntropyEngine.format_search_space(length, pool_size)
        crack_times = EntropyEngine.estimate_crack_times(entropy_bits)

        # Category counts
        count_upper = sum(1 for c in password if c in CharacterMap.UPPERCASE)
        count_lower = sum(1 for c in password if c in CharacterMap.LOWERCASE)
        count_num = sum(1 for c in password if c in CharacterMap.NUMBERS)
        count_sym = sum(1 for c in password if c in CharacterMap.SYMBOLS)
        count_oth = length - (count_upper + count_lower + count_num + count_sym)

        breakdown = [
            {"category": "Uppercase (A-Z)", "count": count_upper, "percentage": round((count_upper / length) * 100, 1), "color": "#00F0FF"},
            {"category": "Lowercase (a-z)", "count": count_lower, "percentage": round((count_lower / length) * 100, 1), "color": "#38BDF8"},
            {"category": "Numbers (0-9)", "count": count_num, "percentage": round((count_num / length) * 100, 1), "color": "#8A2BE2"},
            {"category": "Symbols", "count": count_sym, "percentage": round((count_sym / length) * 100, 1), "color": "#00FFA3"},
        ]
        if count_oth > 0:
            breakdown.append({
                "category": "Extended/Other",
                "count": count_oth,
                "percentage": round((count_oth / length) * 100, 1),
                "color": "#A855F7",
            })

        # Generate targeted recommendations
        recommendations = []
        if length < 12:
            recommendations.append("Increase password length to at least 16 characters for enterprise resistance.")
        if not has_upper:
            recommendations.append("Include uppercase characters (A-Z) to widen the search space.")
        if not has_lower:
            recommendations.append("Include lowercase characters (a-z).")
        if not has_numbers:
            recommendations.append("Incorporate numerical digits (0-9).")
        if not has_symbols:
            recommendations.append("Add special symbols to maximize combinatorial variety.")
        if entropy_bits < 80:
            recommendations.append("Current entropy is below 80 bits; consider 16+ characters with all 4 character groups.")
        if not recommendations:
            recommendations.append("Excellent password configuration. Meets quantum-grade resilience criteria.")

        return {
            "length": length,
            "character_categories": {
                "uppercase": has_upper,
                "lowercase": has_lower,
                "numbers": has_numbers,
                "symbols": has_symbols,
                "other": has_other,
            },
            "character_set_size": pool_size,
            "theoretical_entropy_bits": entropy_bits,
            "strength": strength,
            "crack_time_estimates": crack_times,
            "search_space": search_space,
            "character_breakdown": breakdown,
            "recommendations": recommendations,
        }
