"""Tests for password generation, rejection sampling, and category constraints."""

import pytest
from password_engine.generator import QuantumPasswordGenerator
from password_engine.character_mapping import CharacterMap


def test_password_length_and_categories():
    """Verify generated password meets requested length and category rules."""
    length = 24
    result = QuantumPasswordGenerator.generate_passwords(
        length=length,
        uppercase=True,
        lowercase=True,
        numbers=True,
        symbols=True,
        count=1,
    )
    pwd = result["primary_password"]

    assert len(pwd) == length
    assert any(c in CharacterMap.UPPERCASE for c in pwd)
    assert any(c in CharacterMap.LOWERCASE for c in pwd)
    assert any(c in CharacterMap.NUMBERS for c in pwd)
    assert any(c in CharacterMap.SYMBOLS for c in pwd)


def test_multiple_password_generation():
    """Verify generating multiple passwords produces distinct requested count."""
    count = 3
    result = QuantumPasswordGenerator.generate_passwords(
        length=16,
        uppercase=True,
        lowercase=True,
        numbers=True,
        symbols=False,
        count=count,
    )
    assert len(result["passwords"]) == count
    for p in result["passwords"]:
        assert len(p) == 16
        # Symbol category was False, so no symbols should be present
        assert not any(c in CharacterMap.SYMBOLS for c in p)


def test_invalid_configurations_rejected():
    """Verify out-of-bounds parameters raise ValueError."""
    # Length too short (< 8)
    with pytest.raises(ValueError):
        QuantumPasswordGenerator.generate_passwords(length=5)

    # Length too long (> 64)
    with pytest.raises(ValueError):
        QuantumPasswordGenerator.generate_passwords(length=100)

    # Count too large (> 10)
    with pytest.raises(ValueError):
        QuantumPasswordGenerator.generate_passwords(length=16, count=15)

    # No categories selected
    with pytest.raises(ValueError):
        QuantumPasswordGenerator.generate_passwords(
            length=16,
            uppercase=False,
            lowercase=False,
            numbers=False,
            symbols=False,
        )


def test_rejection_sampling_metrics():
    """Verify sampling metrics track candidates accepted and rejected."""
    result = QuantumPasswordGenerator.generate_passwords(length=20, count=1)
    metrics = result["sampling_metrics"]

    assert metrics["candidates_accepted"] == 20
    assert metrics["candidates_rejected"] >= 0
    assert metrics["quantum_bits_consumed"] > 0
    assert 0 <= metrics["rejection_rate_pct"] <= 100
