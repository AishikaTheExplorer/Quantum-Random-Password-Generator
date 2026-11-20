"""Measurement data formatting and Bloch coordinate transforms."""

import math
from typing import Dict, Any


class MeasurementDataFormatter:
    """Prepares measurement telemetry and Bloch coordinates for 3D visualization."""

    @staticmethod
    def bloch_angles_to_cartesian(theta: float, phi: float) -> Dict[str, float]:
        """
        Converts spherical Bloch sphere angles (theta in [0, pi], phi in [0, 2*pi])
        to 3D unit vector Cartesian coordinates:
        x = sin(theta) * cos(phi)
        y = sin(theta) * sin(phi)
        z = cos(theta)
        """
        x = math.sin(theta) * math.cos(phi)
        y = math.sin(theta) * math.sin(phi)
        z = math.cos(theta)
        return {"x": round(x, 4), "y": round(y, 4), "z": round(z, 4)}

    @staticmethod
    def state_probabilities_from_angles(theta: float) -> Dict[str, float]:
        """
        Computes theoretical probabilities for state |psi> = cos(theta/2)|0> + e^(i*phi)*sin(theta/2)|1>:
        P(|0>) = cos^2(theta / 2)
        P(|1>) = sin^2(theta / 2)
        """
        p0 = (math.cos(theta / 2.0)) ** 2
        p1 = (math.sin(theta / 2.0)) ** 2
        return {"prob_0": round(p0, 5), "prob_1": round(p1, 5)}
