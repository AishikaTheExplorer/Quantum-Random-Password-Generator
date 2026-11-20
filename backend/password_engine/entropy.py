"""Password entropy calculation, search-space size, and attacker model evaluation."""

import math
from itertools import combinations
from typing import Dict, Any, List


class EntropyEngine:
    """
    Computes theoretical Shannon entropy, state-space cardinality,
    and attack complexity across classical and theoretical quantum adversaries.
    
    Distinguishes rigorously between:
    1. Unconstrained password generation: H = L * log2(N), S = N^L
    2. Category-constrained uniform generation: H = log2(M), S = M
       where M is the exact count of valid passwords containing at least
       one character from each required category (computed via Principle of Inclusion-Exclusion).
    """

    @staticmethod
    def calculate_theoretical_entropy(length: int, character_set_size: int) -> float:
        """
        Theoretical Shannon entropy for independently and uniformly drawn characters (unconstrained):
        H = L * log2(N)
        where:
        - L = password length
        - N = size of the character pool
        """
        if length <= 0 or character_set_size <= 1:
            return 0.0
        entropy = length * math.log2(character_set_size)
        return round(entropy, 2)

    @staticmethod
    def calculate_exact_constrained_keyspace(length: int, category_sizes: List[int]) -> int:
        """
        Calculates the exact number of passwords M of length L that contain at least one
        character from each required category, using the Principle of Inclusion-Exclusion (PIE).

        Formula:
        M = sum_{J subset of {1..m}} (-1)^|J| * (N - sum_{j in J} n_j)^L
        where:
        - m = number of selected categories
        - n_j = size of category j
        - N = sum_{j=1}^m n_j (total character pool size)
        - J = subset of omitted categories
        """
        if length <= 0 or not category_sizes:
            return 0
        m = len(category_sizes)
        if length < m:
            return 0  # Impossible to have at least 1 character from each of m categories if L < m

        n_total = sum(category_sizes)
        total_valid = 0

        # Iterate over all subset sizes of omitted categories |J| from 0 to m
        for k in range(m + 1):
            sign = (-1) ** k
            for subset in combinations(category_sizes, k):
                available = n_total - sum(subset)
                term = (available ** length) if available > 0 else 0
                total_valid += sign * term

        return total_valid

    @staticmethod
    def calculate_constrained_entropy(length: int, category_sizes: List[int]) -> float:
        """
        Exact Shannon entropy of a uniformly distributed password over the valid
        constrained password space of cardinality M:
        H = log2(M)
        """
        m_valid = EntropyEngine.calculate_exact_constrained_keyspace(length, category_sizes)
        if m_valid <= 0:
            return 0.0
        return round(math.log2(m_valid), 2)

    @staticmethod
    def classify_strength(entropy_bits: float) -> Dict[str, str]:
        """Classifies password strength tier based on theoretical entropy."""
        if entropy_bits < 40:
            return {
                "level": "Very Weak",
                "color": "#EF4444",
                "badge": "CRITICAL",
                "description": "Vulnerable to immediate online brute-force and rapid credential stuffing."
            }
        elif entropy_bits < 60:
            return {
                "level": "Weak",
                "color": "#F97316",
                "badge": "LOW",
                "description": "Easily broken by modest offline dictionary and GPU cluster attacks."
            }
        elif entropy_bits < 80:
            return {
                "level": "Moderate",
                "color": "#EAB308",
                "badge": "MODERATE",
                "description": "Resistant to basic offline attacks, but susceptible to high-performance GPU rigs."
            }
        elif entropy_bits < 100:
            return {
                "level": "Strong",
                "color": "#10B981",
                "badge": "STRONG",
                "description": "Adequate for modern high-assurance web and enterprise authentication standards."
            }
        elif entropy_bits < 128:
            return {
                "level": "Very Strong",
                "color": "#00F0FF",
                "badge": "VERY STRONG",
                "description": "Computationally infeasible to compromise with current classical supercomputers."
            }
        else:
            return {
                "level": "Quantum Grade",
                "color": "#A855F7",
                "badge": "QUANTUM GRADE",
                "description": "Exceeds 128 bits of entropy; provides safety margin against theoretical Grover quadratic search."
            }

    @staticmethod
    def format_search_space(
        length: int,
        character_set_size: int,
        category_sizes: List[int] = None
    ) -> Dict[str, Any]:
        """
        Formats combinatorial keyspace in human-readable scientific notation.
        If category_sizes is provided, uses exact constrained cardinality M via Inclusion-Exclusion;
        otherwise defaults to unconstrained N^L.
        """
        if length <= 0 or character_set_size <= 0:
            return {
                "exact_cardinality": "0",
                "scientific": "0",
                "log10": 0.0,
                "is_constrained": False,
                "unconstrained_scientific": "0",
            }

        unconstrained_cardinality = character_set_size ** length
        unconstrained_log10 = length * math.log10(character_set_size)
        u_exp = int(math.floor(unconstrained_log10))
        u_mantissa = 10 ** (unconstrained_log10 - u_exp)
        u_sci = f"{u_mantissa:.2f} × 10^{u_exp}"

        if category_sizes and len(category_sizes) > 1:
            exact_m = EntropyEngine.calculate_exact_constrained_keyspace(length, category_sizes)
            if exact_m > 0:
                log10_total = math.log10(exact_m)
                exponent = int(math.floor(log10_total))
                mantissa = 10 ** (log10_total - exponent)
                scientific_str = f"{mantissa:.2f} × 10^{exponent}"
                two_power_bits = round(math.log2(exact_m), 2)
                return {
                    "scientific": scientific_str,
                    "exponent": exponent,
                    "mantissa": round(mantissa, 2),
                    "log10_size": round(log10_total, 2),
                    "two_power_bits": two_power_bits,
                    "exact_cardinality": str(exact_m),
                    "is_constrained": True,
                    "unconstrained_scientific": u_sci,
                    "unconstrained_bits": round(length * math.log2(character_set_size), 2),
                }

        return {
            "scientific": u_sci,
            "exponent": u_exp,
            "mantissa": round(u_mantissa, 2),
            "log10_size": round(unconstrained_log10, 2),
            "two_power_bits": round(length * math.log2(character_set_size), 2),
            "exact_cardinality": str(unconstrained_cardinality),
            "is_constrained": False,
            "unconstrained_scientific": u_sci,
            "unconstrained_bits": round(length * math.log2(character_set_size), 2),
        }

    @staticmethod
    def estimate_crack_times(entropy_bits: float) -> Dict[str, Dict[str, Any]]:
        """
        Estimates brute-force exhaust times under explicitly documented attacker threat models.
        
        Assumptions:
        - Attacker tests keys sequentially in random order; expected iterations = 2^(H - 1).
        - For quantum adversary: ideal Grover search has quadratic query complexity O(sqrt(S)).
          Specifically, expected oracle calls = (pi / 4) * sqrt(2^H).
          Note: This is a theoretical query complexity model, not a measured empirical attack time.
        """
        # Expected attempts to find the key = 2^(H - 1)
        expected_attempts = 2.0 ** max(0.0, entropy_bits - 1.0) if entropy_bits < 1024 else float("inf")

        models = {
            "online_rate_limited": {
                "name": "Online Web Service (Rate-Limited)",
                "rate_per_sec": 100,  # 100 guesses/sec (throttled)
                "description": "Standard login form with anti-hammering / CAPTCHA throttling (100 guesses/sec).",
            },
            "offline_fast_gpu": {
                "name": "Offline Consumer GPU (8x RTX 4090)",
                "rate_per_sec": 1e11,  # 100 billion NTLM/MD5 hashes/sec
                "description": "Optimized Hashcat cluster executing unsalted MD5 / NTLM (10^11 hashes/sec).",
            },
            "offline_supercomputer": {
                "name": "Nation-State / Distributed Cluster",
                "rate_per_sec": 1e15,  # 1 quadrillion guesses/sec
                "description": "Massive ASIC / distributed botnet keyspace traversal (10^15 hashes/sec).",
            },
            "quantum_grover_oracle": {
                "name": "Theoretical Quantum Computer (Grover Search)",
                "rate_per_sec": 1e9,  # 1 billion oracle calls/sec
                "description": "Theoretical quadratic query speedup: O(sqrt(S)) evaluations at 10^9 calls/sec. (Assumes perfect quantum oracle).",
                "is_quantum": True,
            },
        }

        results = {}
        for key, model in models.items():
            if model.get("is_quantum"):
                # Grover search requires ~ (pi/4) * sqrt(2^H) oracle evaluations
                quantum_evals = (math.pi / 4.0) * (2.0 ** (entropy_bits / 2.0))
                seconds = quantum_evals / model["rate_per_sec"]
            else:
                seconds = expected_attempts / model["rate_per_sec"]

            time_formatted = EntropyEngine._format_duration(seconds)
            results[key] = {
                "attacker_model": model["name"],
                "rate_display": f"{model['rate_per_sec']:.0e} guesses/sec" if not model.get("is_quantum") else "1e+09 oracle calls/sec",
                "description": model["description"],
                "seconds": seconds,
                "human_time": time_formatted,
            }

        return results

    @staticmethod
    def _format_duration(seconds: float) -> str:
        """Formats seconds into human-readable scientific durations."""
        if seconds < 0.001:
            return "< 1 Millisecond"
        elif seconds < 1.0:
            return f"{round(seconds * 1000, 1)} Milliseconds"
        elif seconds < 60:
            return f"{round(seconds, 1)} Seconds"
        elif seconds < 3600:
            return f"{round(seconds / 60, 1)} Minutes"
        elif seconds < 86400:
            return f"{round(seconds / 3600, 1)} Hours"
        elif seconds < 86400 * 365.25:
            return f"{round(seconds / 86400, 1)} Days"
        elif seconds < 86400 * 365.25 * 1000:
            years = seconds / (86400 * 365.25)
            return f"{round(years, 1)} Years"
        else:
            years = seconds / (86400 * 365.25)
            exp = int(math.floor(math.log10(years)))
            mantissa = years / (10 ** exp)
            return f"{mantissa:.2f} × 10^{exp} Years"
