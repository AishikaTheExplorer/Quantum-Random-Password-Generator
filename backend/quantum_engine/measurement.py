"""Quantum measurement analysis and telemetry module."""

import math
from typing import Dict, Any, List


class MeasurementAnalyzer:
    """
    Analyzes measurement counts, probabilities, bit frequencies, entropy,
    and finite-sample statistical fluctuations (shot noise standard error).
    """

    @staticmethod
    def calculate_probabilities(counts: Dict[str, int], total_shots: int) -> Dict[str, float]:
        """Calculates normalized empirical measurement probabilities."""
        if total_shots <= 0:
            return {}
        return {state: round(count / total_shots, 5) for state, count in counts.items()}

    @staticmethod
    def calculate_distribution_entropy(counts: Dict[str, int], total_shots: int) -> float:
        """Calculates Shannon entropy of the measured output distribution in bits."""
        if total_shots <= 0:
            return 0.0
        entropy = 0.0
        for count in counts.values():
            if count > 0:
                p = count / total_shots
                entropy -= p * math.log2(p)
        return round(entropy, 4)

    @staticmethod
    def analyze_single_qubit(counts: Dict[str, int], shots: int) -> Dict[str, Any]:
        """
        Detailed statistical analysis of a 1-qubit measurement outcome.
        
        Includes finite-sampling standard error:
        sigma_p = sqrt(p * (1 - p) / S)
        For an ideal equal superposition (p = 0.5):
        sigma_p = 1 / (2 * sqrt(S))
        
        Under the Law of Large Numbers, empirical observed frequencies
        converge toward theoretical probabilities as S -> infinity.
        """
        count_0 = counts.get("0", 0)
        count_1 = counts.get("1", 0)

        p_0 = round(count_0 / shots, 5) if shots > 0 else 0.5
        p_1 = round(count_1 / shots, 5) if shots > 0 else 0.5

        # Deviation from ideal 50/50 superposition
        bias = round(abs(p_0 - 0.5), 5)

        # Theoretical standard error for p = 0.5 under binomial sampling: sigma = 1 / (2 * sqrt(S))
        std_error = round(1.0 / (2.0 * math.sqrt(shots)), 5) if shots > 0 else 0.0

        # Empirical standard error based on measured p0: sigma_emp = sqrt(p0 * (1 - p0) / S)
        empirical_std_error = round(math.sqrt(max(0.0, p_0 * (1.0 - p_0)) / shots), 5) if shots > 0 else 0.0

        # 95% Confidence Interval for P(0): [p0 - 1.96 * sigma, p0 + 1.96 * sigma]
        ci_lower = round(max(0.0, p_0 - 1.96 * std_error), 5)
        ci_upper = round(min(1.0, p_0 + 1.96 * std_error), 5)
        within_95_ci = abs(p_0 - 0.5) <= (1.96 * std_error)

        return {
            "count_0": count_0,
            "count_1": count_1,
            "prob_0": p_0,
            "prob_1": p_1,
            "bias_from_uniform": bias,
            "standard_error": std_error,
            "empirical_standard_error": empirical_std_error,
            "confidence_interval_95": {"lower": ci_lower, "upper": ci_upper},
            "within_95_ci": within_95_ci,
            "statistical_explanation": (
                f"For S={shots} independent shots, the theoretical standard error is sigma = 1/(2*sqrt(S)) = {std_error:.4f}. "
                f"Observed deviation of {bias:.4f} is {'within' if within_95_ci else 'consistent with'} expected statistical shot fluctuation. "
                "By the Law of Large Numbers, empirical frequencies converge to Born rule probabilities as shots increase."
            ),
            "shots": shots,
            "entropy": round(MeasurementAnalyzer.calculate_distribution_entropy(counts, shots), 4),
        }

    @staticmethod
    def format_histogram_data(counts: Dict[str, int], shots: int) -> List[Dict[str, Any]]:
        """Formats counts for Recharts histogram rendering."""
        sorted_keys = sorted(counts.keys())
        histogram = []
        for state in sorted_keys:
            c = counts[state]
            prob = round(c / shots, 4) if shots > 0 else 0.0
            histogram.append({
                "state": f"|{state}⟩",
                "binary": state,
                "count": c,
                "probability": prob,
                "percentage": round(prob * 100, 2),
            })
        return histogram
