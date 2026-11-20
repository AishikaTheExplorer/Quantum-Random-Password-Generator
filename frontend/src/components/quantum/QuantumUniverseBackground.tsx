import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface QuantumUniverseProps {
  formationProgress: number; // 0.0 = widely scattered, 1.0 = assembled 3D quantum orbital structure
  isIntroActive: boolean;
}

// Custom GLSL Shader for the 3D Atomic / Quantum Orbital Structure
const QuantumOrbitalShaderMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uFormation;
    uniform float uPixelRatio;
    uniform float uDim;

    attribute vec3 aScatteredPosition;
    attribute vec3 aOrbitAxisU;
    attribute vec3 aOrbitAxisV;
    attribute vec3 aOrbitNormal;
    attribute vec2 aOrbitRadii;     // x = a (semi-major), y = b (semi-minor)
    attribute float aOrbitAngle;
    attribute float aOrbitSpeed;
    attribute float aIsCore;
    attribute float aColorMix;
    attribute float aSize;
    attribute float aPhase;

    varying float vColorMix;
    varying float vAlpha;
    varying float vIsCore;

    void main() {
      vColorMix = aColorMix;
      vIsCore = aIsCore;

      // 1. SCATTERED COSMIC STATE (uFormation = 0.0)
      // Dispersed in 3D space with gentle quantum wave oscillations
      vec3 scatteredPos = aScatteredPosition;
      scatteredPos.x += sin(uTime * 0.22 + aPhase) * 0.36;
      scatteredPos.y += cos(uTime * 0.18 + aPhase * 1.3) * 0.36;
      scatteredPos.z += sin(uTime * 0.25 + aPhase * 0.7) * 0.36;

      // 2. STRUCTURED 3D QUANTUM ORBITAL STATE (uFormation = 1.0)
      vec3 orbitalPos;

      if (aIsCore > 0.5) {
        // Bright Central Nucleus: concentrated core with radial quantum energy pulsation
        float pulse = 1.0 + 0.08 * sin(uTime * 2.8 + aPhase * 2.5);
        orbitalPos = aScatteredPosition * 0.13 * pulse;
        orbitalPos += vec3(
          sin(uTime * 1.5 + aPhase) * 0.02,
          cos(uTime * 1.4 + aPhase) * 0.02,
          sin(uTime * 1.6 + aPhase) * 0.02
        );
      } else {
        // Intersecting Elliptical Orbital Rings: particles travel along tilted 3D orbital trajectories
        float currentAngle = aOrbitAngle + uTime * aOrbitSpeed;
        
        // Parametric ellipse in 3D basis: r(theta) = U * (a * cos theta) + V * (b * sin theta)
        vec3 ellipsePoint = aOrbitAxisU * (aOrbitRadii.x * cos(currentAngle)) +
                            aOrbitAxisV * (aOrbitRadii.y * sin(currentAngle));
        
        // Subtle quantum wave packet uncertainty along normal direction
        ellipsePoint += aOrbitNormal * (sin(currentAngle * 2.5 + uTime * 1.2) * 0.06);
        orbitalPos = ellipsePoint;
      }

      // 3. SMOOTH NON-LINEAR FORMATION INTERPOLATION
      float ease = smoothstep(0.0, 1.0, uFormation);
      vec3 finalPos = mix(scatteredPos, orbitalPos, ease);

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Point size attenuated by camera depth
      float sizeMultiplier = mix(1.0, 1.35, ease);
      if (aIsCore > 0.5) sizeMultiplier *= 1.45;

      // Dimming when acting as persistent background behind application cards
      float dimMultiplier = mix(1.0, 0.76, uDim);
      gl_PointSize = (aSize * sizeMultiplier * dimMultiplier * uPixelRatio * 30.0) / -mvPosition.z;

      // Alpha transparency
      vAlpha = mix(0.65, 0.95, ease) * dimMultiplier;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uFormation;
    uniform float uDim;

    varying float vColorMix;
    varying float vAlpha;
    varying float vIsCore;

    void main() {
      // Exponential Gaussian falloff for soft, glowing circular quantum particles
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      float strength = exp(-dist * dist * 14.0);

      // Color Palette:
      // Electric Cyan:   #00F0FF (vec3(0.0, 0.941, 1.0))
      // Ultraviolet:     #8A2BE2 (vec3(0.541, 0.169, 0.886))
      // Quantum Violet:  #8B5CF6 (vec3(0.545, 0.361, 0.965))
      // Hot White Core:  #FFFFFF (vec3(1.0, 1.0, 1.0))

      vec3 cyan = vec3(0.0, 0.941, 1.0);
      vec3 ultraviolet = vec3(0.541, 0.169, 0.886);
      vec3 violet = vec3(0.545, 0.361, 0.965);
      vec3 whiteCore = vec3(1.0, 1.0, 1.0);

      vec3 orbitColor = mix(cyan, mix(ultraviolet, violet, 0.4), vColorMix);

      // Luminous Nucleus particles receive intense white-hot core energy
      if (vIsCore > 0.5) {
        float coreFlash = 0.55 + 0.3 * sin(uTime * 3.2);
        orbitColor = mix(orbitColor, whiteCore, coreFlash);
      }

      // Glow amplification in formed state
      float glow = mix(1.1, 1.45, uFormation);
      gl_FragColor = vec4(orbitColor * glow, strength * vAlpha);
    }
  `,
};

interface ParticleMeshProps {
  formation: number;
  isIntroActive: boolean;
}

const QuantumOrbitalMesh: React.FC<ParticleMeshProps> = ({ formation, isIntroActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Interaction & Rotation State with Physics Momentum
  const rotationY = useRef<number>(0);
  const rotationX = useRef<number>(0.25);
  const targetRotationY = useRef<number>(0);
  const targetRotationX = useRef<number>(0.25);
  const isDragging = useRef<boolean>(false);
  const previousPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calibrated slow automatic rotation (calm, scientific 3D model)
  const autoRotateSpeed = useRef<number>(0.07);

  // Parallax subtle offset
  const parallaxOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 12,000–15,000 particles on desktop, GPU-efficient adaptive density
  const particleCount = useMemo(() => {
    if (typeof window === 'undefined') return 8000;
    return window.innerWidth < 768 ? 6000 : 14000;
  }, []);

  // Generate 3D Scattered & Quantum Orbital Structures
  const [
    scatteredPositions,
    axisUArray,
    axisVArray,
    normalsArray,
    radiiArray,
    anglesArray,
    speedsArray,
    isCoreArray,
    colorMixArray,
    sizesArray,
    phasesArray,
  ] = useMemo(() => {
    const scattered = new Float32Array(particleCount * 3);
    const axisU = new Float32Array(particleCount * 3);
    const axisV = new Float32Array(particleCount * 3);
    const normals = new Float32Array(particleCount * 3);
    const radii = new Float32Array(particleCount * 2);
    const angles = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const isCore = new Float32Array(particleCount);
    const colorMix = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    // Define 5 distinct intersecting 3D elliptical orbital planes
    // Each plane has a unique 3D normal vector, major/minor axes, speed, and base color
    const orbitalPlanes = [
      // Orbit 1: Tilted 56 deg around X (Electric Cyan)
      {
        normal: new THREE.Vector3(0, Math.sin(0.98), Math.cos(0.98)).normalize(),
        a: 3.5,
        b: 1.95,
        speed: 0.55,
        colorBase: 0.1, // Cyan dominant
      },
      // Orbit 2: Tilted -52 deg around X, 32 deg around Y (Ultraviolet)
      {
        normal: new THREE.Vector3(Math.sin(0.55), -Math.sin(0.9), Math.cos(0.9)).normalize(),
        a: 3.65,
        b: 2.1,
        speed: -0.48,
        colorBase: 0.9, // Ultraviolet dominant
      },
      // Orbit 3: Tilted 68 deg around Z, -38 deg around Y (Secondary Cyan)
      {
        normal: new THREE.Vector3(-Math.sin(0.65), Math.cos(1.18), Math.sin(1.18)).normalize(),
        a: 3.4,
        b: 2.2,
        speed: 0.62,
        colorBase: 0.25, // Cyan/teal
      },
      // Orbit 4: Tilted -66 deg around Z, 42 deg around X (Quantum Violet)
      {
        normal: new THREE.Vector3(Math.sin(1.15), -Math.sin(0.72), Math.cos(0.72)).normalize(),
        a: 3.8,
        b: 1.85,
        speed: -0.52,
        colorBase: 0.8, // Violet
      },
      // Orbit 5: Equatorial precessing ring tilted 25 deg (Complementary mix)
      {
        normal: new THREE.Vector3(0.35, 0.92, 0.18).normalize(),
        a: 3.95,
        b: 2.45,
        speed: 0.42,
        colorBase: 0.5, // Balanced mix
      },
    ];

    // Compute robust orthonormal basis vectors (U, V) for each orbital plane
    const planeBases = orbitalPlanes.map((plane) => {
      const u = new THREE.Vector3();
      if (Math.abs(plane.normal.x) > 0.85) {
        u.set(0, 1, 0).cross(plane.normal).normalize();
      } else {
        u.set(1, 0, 0).cross(plane.normal).normalize();
      }
      const v = new THREE.Vector3().crossVectors(plane.normal, u).normalize();
      return { ...plane, u, v };
    });

    // ~22% particles in luminous central nucleus, ~78% in intersecting elliptical orbits
    const coreCount = Math.floor(particleCount * 0.22);

    for (let i = 0; i < particleCount; i++) {
      phases[i] = Math.random() * Math.PI * 2;

      // 1. SCATTERED 3D COSMIC DISTRIBUTION (uFormation = 0)
      // Dispersed in a wide spherical volume, leaving the center relatively clear
      const thetaS = Math.random() * Math.PI * 2;
      const phiS = Math.acos(2 * Math.random() - 1);
      const rS = Math.pow(Math.random(), 0.55) * 6.8 + 1.2;

      scattered[i * 3] = rS * Math.sin(phiS) * Math.cos(thetaS);
      scattered[i * 3 + 1] = rS * Math.sin(phiS) * Math.sin(thetaS);
      scattered[i * 3 + 2] = rS * Math.cos(phiS);

      angles[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 1.4 + 0.8;

      if (i < coreCount) {
        // --- ZONE A: Central Luminous Nucleus ---
        isCore[i] = 1.0;
        axisU[i * 3] = 1; axisU[i * 3 + 1] = 0; axisU[i * 3 + 2] = 0;
        axisV[i * 3] = 0; axisV[i * 3 + 1] = 1; axisV[i * 3 + 2] = 0;
        normals[i * 3] = 0; normals[i * 3 + 1] = 0; normals[i * 3 + 2] = 1;

        radii[i * 2] = 0.65;
        radii[i * 2 + 1] = 0.65;
        speeds[i] = (Math.random() - 0.5) * 0.35;
        // Nucleus contains both bright cyan and ultraviolet/white particles
        colorMix[i] = Math.random() > 0.5 ? 0.1 : 0.85;
        sizes[i] = Math.random() * 1.6 + 1.1; // Slightly larger for nuclear brightness
      } else {
        // --- ZONE B: Intersecting Elliptical Orbital Rings ---
        isCore[i] = 0.0;
        const planeIdx = i % planeBases.length;
        const plane = planeBases[planeIdx];

        axisU[i * 3] = plane.u.x;
        axisU[i * 3 + 1] = plane.u.y;
        axisU[i * 3 + 2] = plane.u.z;

        axisV[i * 3] = plane.v.x;
        axisV[i * 3 + 1] = plane.v.y;
        axisV[i * 3 + 2] = plane.v.z;

        normals[i * 3] = plane.normal.x;
        normals[i * 3 + 1] = plane.normal.y;
        normals[i * 3 + 2] = plane.normal.z;

        // Slight radius jitter to give volumetric 3D orbital path thickness
        const rJitter = (Math.random() - 0.5) * 0.22;
        radii[i * 2] = plane.a + rJitter;
        radii[i * 2 + 1] = plane.b + rJitter;

        // Particle speed along elliptical orbit
        speeds[i] = plane.speed * (0.88 + Math.random() * 0.24);
        colorMix[i] = Math.min(1.0, Math.max(0.0, plane.colorBase + (Math.random() - 0.5) * 0.2));
      }
    }

    return [
      scattered,
      axisU,
      axisV,
      normals,
      radii,
      angles,
      speeds,
      isCore,
      colorMix,
      sizes,
      phases,
    ];
  }, [particleCount]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFormation: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uDim: { value: 0 },
    }),
    []
  );

  // Mouse & Touch 3D Rotation Controls with Inertia
  const handlePointerDown = useCallback((e: MouseEvent | TouchEvent) => {
    // Only capture drag if clicking empty background or canvas, not interactive UI elements
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button, input, select, textarea, a, [role="button"]')) {
      return;
    }
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    previousPointer.current = { x: clientX, y: clientY };
  }, []);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isDragging.current) {
      const deltaX = clientX - previousPointer.current.x;
      const deltaY = clientY - previousPointer.current.y;

      targetRotationY.current += deltaX * 0.0055;
      targetRotationX.current = Math.min(
        Math.PI * 0.45,
        Math.max(-Math.PI * 0.45, targetRotationX.current + deltaY * 0.0045)
      );

      previousPointer.current = { x: clientX, y: clientY };
    } else {
      // Subtle mouse parallax when resting
      const normX = (clientX / window.innerWidth - 0.5) * 0.25;
      const normY = (clientY / window.innerHeight - 0.5) * 0.18;
      parallaxOffset.current = { x: normX, y: normY };
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.getElapsedTime();

    // Smooth damp towards target formation progress
    uniforms.uFormation.value = THREE.MathUtils.lerp(
      uniforms.uFormation.value,
      formation,
      Math.min(1, delta * 3.5)
    );

    // Dim background slightly when user enters application to protect text contrast
    const targetDim = isIntroActive ? 0.0 : 0.38;
    uniforms.uDim.value = THREE.MathUtils.lerp(uniforms.uDim.value, targetDim, Math.min(1, delta * 2.0));

    // Continuous automatic slow rotation when not dragging (calm scientific model)
    if (!isDragging.current) {
      targetRotationY.current += autoRotateSpeed.current * delta * 0.28;
    }

    // Apply gentle inertia damping to rotation
    rotationY.current = THREE.MathUtils.lerp(rotationY.current, targetRotationY.current, Math.min(1, delta * 5.0));
    rotationX.current = THREE.MathUtils.lerp(rotationX.current, targetRotationX.current, Math.min(1, delta * 5.0));

    if (groupRef.current) {
      groupRef.current.rotation.y = rotationY.current + parallaxOffset.current.x;
      groupRef.current.rotation.x = rotationX.current + parallaxOffset.current.y;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[scatteredPositions, 3]} />
          <bufferAttribute attach="attributes-aScatteredPosition" args={[scatteredPositions, 3]} />
          <bufferAttribute attach="attributes-aOrbitAxisU" args={[axisUArray, 3]} />
          <bufferAttribute attach="attributes-aOrbitAxisV" args={[axisVArray, 3]} />
          <bufferAttribute attach="attributes-aOrbitNormal" args={[normalsArray, 3]} />
          <bufferAttribute attach="attributes-aOrbitRadii" args={[radiiArray, 2]} />
          <bufferAttribute attach="attributes-aOrbitAngle" args={[anglesArray, 1]} />
          <bufferAttribute attach="attributes-aOrbitSpeed" args={[speedsArray, 1]} />
          <bufferAttribute attach="attributes-aIsCore" args={[isCoreArray, 1]} />
          <bufferAttribute attach="attributes-aColorMix" args={[colorMixArray, 1]} />
          <bufferAttribute attach="attributes-aSize" args={[sizesArray, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[phasesArray, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={QuantumOrbitalShaderMaterial.vertexShader}
          fragmentShader={QuantumOrbitalShaderMaterial.fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export const QuantumUniverseBackground: React.FC<QuantumUniverseProps> = ({
  formationProgress,
  isIntroActive,
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#03050A] overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00F0FF]/10 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8A2BE2]/10 rounded-full filter blur-[140px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-auto z-0 overflow-hidden bg-[#03050A]">
      {/* Dark Vignette around screen borders for depth */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#03050A_95%)]" />

      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 48 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <QuantumOrbitalMesh formation={formationProgress} isIntroActive={isIntroActive} />
      </Canvas>
    </div>
  );
};

export default QuantumUniverseBackground;
