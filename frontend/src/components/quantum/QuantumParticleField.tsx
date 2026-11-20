import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  density?: number; // scale: 0.5 to 2.0
  speed?: number;   // scale: 0.5 to 3.0
  interactive?: boolean;
}

const EntanglementParticles: React.FC<{ density: number; speed: number }> = ({ density, speed }) => {
  const pointsRefA = useRef<THREE.Points>(null);
  const pointsRefB = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const baseCount = Math.floor(120 * density);

  // Cluster A (|0> state, Cyan)
  const [positionsA, velocitiesA] = useMemo(() => {
    const pos = new Float32Array(baseCount * 3);
    const vel = new Float32Array(baseCount * 3);
    for (let i = 0; i < baseCount; i++) {
      // Centered around x = -2.5
      pos[i * 3] = -2.5 + (Math.random() - 0.5) * 3.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;

      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return [pos, vel];
  }, [baseCount]);

  // Cluster B (|1> state, Violet/Ultraviolet)
  const [positionsB, velocitiesB] = useMemo(() => {
    const pos = new Float32Array(baseCount * 3);
    const vel = new Float32Array(baseCount * 3);
    for (let i = 0; i < baseCount; i++) {
      // Centered around x = +2.5
      pos[i * 3] = 2.5 + (Math.random() - 0.5) * 3.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;

      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return [pos, vel];
  }, [baseCount]);

  // Entanglement filaments connecting pairs between Cluster A and Cluster B
  const filamentCount = Math.min(24, Math.floor(baseCount / 4));
  const linePositions = useMemo(() => {
    const arr = new Float32Array(filamentCount * 2 * 3);
    return arr;
  }, [filamentCount]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime() * speed;
    const mouseX = state.pointer.x * 0.8;

    if (pointsRefA.current && pointsRefB.current) {
      const geoA = pointsRefA.current.geometry;
      const geoB = pointsRefB.current.geometry;
      const posA = geoA.attributes.position.array as Float32Array;
      const posB = geoB.attributes.position.array as Float32Array;

      // Update positions with subtle harmonic drift and mouse reactivity
      for (let i = 0; i < baseCount; i++) {
        posA[i * 3] += velocitiesA[i * 3] * speed + Math.sin(elapsed + i) * 0.001;
        posA[i * 3 + 1] += velocitiesA[i * 3 + 1] * speed + Math.cos(elapsed * 0.8 + i) * 0.001;
        posA[i * 3] += (mouseX - posA[i * 3]) * 0.0003;

        posB[i * 3] += velocitiesB[i * 3] * speed + Math.cos(elapsed + i) * 0.001;
        posB[i * 3 + 1] += velocitiesB[i * 3 + 1] * speed + Math.sin(elapsed * 0.8 + i) * 0.001;
        posB[i * 3] += (mouseX - posB[i * 3]) * 0.0003;
      }

      geoA.attributes.position.needsUpdate = true;
      geoB.attributes.position.needsUpdate = true;

      // Update filaments between cluster pairs
      if (linesRef.current) {
        const lineGeo = linesRef.current.geometry;
        const lineArr = lineGeo.attributes.position.array as Float32Array;

        for (let j = 0; j < filamentCount; j++) {
          const idxA = j * 3;
          const idxB = j * 3;

          lineArr[j * 6] = posA[idxA];
          lineArr[j * 6 + 1] = posA[idxA + 1];
          lineArr[j * 6 + 2] = posA[idxA + 2];

          lineArr[j * 6 + 3] = posB[idxB];
          lineArr[j * 6 + 4] = posB[idxB + 1];
          lineArr[j * 6 + 5] = posB[idxB + 2];
        }

        lineGeo.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Cluster A: Cyan |0> */}
      <points ref={pointsRefA}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positionsA, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color="#00F0FF"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Cluster B: Ultraviolet |1> */}
      <points ref={pointsRefB}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positionsB, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color="#A855F7"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Entanglement Filaments */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

export const QuantumParticleField: React.FC<ParticleFieldProps> = ({
  density = 1.0,
  speed = 1.0,
}) => {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <EntanglementParticles density={density} speed={speed} />
      </Canvas>
    </div>
  );
};
