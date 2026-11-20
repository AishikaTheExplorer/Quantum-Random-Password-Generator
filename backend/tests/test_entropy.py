"""Tests for Shannon entropy calculations, search space size, and strength analyzer."""

import math
import pytest
from password_engine.entropy import EntropyEngine
from password_engine.strength_analyzer import PasswordStrengthAnalyzer


def test_theoretical_entropy_calculation():
    """Verify H = L * log2(N) calculation."""
    length = 16
    pool_size = 62  # 26 upper + 26 lower + 10 numbers
    expected = round(16 * math.log2(62), 2)
    calculated = EntropyEngine.calculate_theoretical_entropy(length, pool_size)
    assert calculated == expected


def test_strength_tier_classification():
    """Verify strength classification bands."""
    assert EntropyEngine.classify_strength(35.0)["level"] == "Very Weak"
    assert EntropyEngine.classify_strength(55.0)["level"] == "Weak"
    assert EntropyEngine.classify_strength(75.0)["level"] == "Moderate"
    assert EntropyEngine.classify_strength(95.0)["level"] == "Strong"
    assert EntropyEngine.classify_strength(115.0)["level"] == "Very Strong"
    assert EntropyEngine.classify_strength(135.0)["level"] == "Quantum Grade"


def test_search_space_formatting():
    """Verify scientific notation and power of two representation."""
    space = EntropyEngine.format_search_space(length=10, character_set_size=10)
    # 10^10 search space
    assert space["exponent"] == 10
    assert "10^10" in space["scientific"]


def test_attacker_models_and_grover():
    """Verify crack time models include classical rate-limited and quantum Grover search."""
    times = EntropyEngine.estimate_crack_times(80.0)
    assert "online_rate_limited" in times
    assert "offline_fast_gpu" in times
    assert "offline_supercomputer" in times
    assert "quantum_grover_oracle" in times

    grover_info = times["quantum_grover_oracle"]
    assert grover_info["seconds"] > 0
    assert "Grover" in grover_info["attacker_model"]


def test_password_strength_analyzer():
    """Verify analyzer identifies categories, breakdown and recommendations."""
    test_pwd = "P@ssw0rd99!Alpha"
    analysis = PasswordStrengthAnalyzer.analyze_password(test_pwd)

    assert analysis["length"] == len(test_pwd)
    assert analysis["character_categories"]["uppercase"] is True
    assert analysis["character_categories"]["lowercase"] is True
    assert analysis["character_categories"]["numbers"] is True
    assert analysis["character_categories"]["symbols"] is True
    assert analysis["theoretical_entropy_bits"] > 80
    assert len(analysis["character_breakdown"]) >= 4
