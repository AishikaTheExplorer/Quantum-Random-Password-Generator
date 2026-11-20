import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MathFormula } from '../ui/MathFormula';

interface BlochSphereProps {
  theta: number; // 0 to pi (polar angle)
  phi: number;   // 0 to 2*pi (azimuthal angle)
  interactive?: boolean;
}

const VectorArrow: React.FC<{ theta: number; phi: number }> = ({ theta, phi }) => {
  const meshRef = useRef<THREE.Group>(null);

  // Physics coordinate mapping into Three.js:
  // North Pole |0> is along +Y
  // South Pole |1> is along -Y
  // |+> is along +X, |-> is along -X
  // |+i> is along +Z, |-i> is along -Z
  const targetX = Math.sin(theta) * Math.cos(phi);
  const targetY = Math.cos(theta);
  const targetZ = Math.sin(theta) * Math.sin(phi);

  const radius = 1.6;
  const targetVec = useMemo(
    () => new THREE.Vector3(targetX, targetY, targetZ).multiplyScalar(radius),
    [targetX, targetY, targetZ]
  );
  const currentVec = useRef(new THREE.Vector3(targetX, targetY, targetZ).multiplyScalar(radius));

  useFrame((_, delta) => {
    if (meshRef.current) {
      currentVec.current.lerp(targetVec, Math.min(1, delta * 8));
    }
  });

  return (
    <group ref={meshRef}>
      {/* State Vector line */}
      <Line
        points={[[0, 0, 0], [targetVec.x, targetVec.y, targetVec.z]]}
        color="#00F0FF"
        lineWidth={3.5}
      />
      {/* Vector Head Glow Tip */}
      <mesh position={[targetVec.x, targetVec.y, targetVec.z]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={2.5}
          roughness={0.1}
        />
      </mesh>
      {/* Projection ring onto equatorial plane */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.595, 1.605, 64]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Dashed line to projection point */}
      <Line
        points={[[targetVec.x, targetVec.y, targetVec.z], [targetVec.x, 0, targetVec.z]]}
        color="#A855F7"
        lineWidth={1.5}
        dashed
        dashScale={20}
        dashSize={0.05}
        gapSize={0.05}
      />
      <mesh position={[targetVec.x, 0, targetVec.z]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#A855F7" />
      </mesh>
    </group>
  );
};

export const BlochSphere3D: React.FC<BlochSphereProps> = ({ theta, phi, interactive = true }) => {
  return (
    <div className="w-full h-full min-h-[340px] relative select-none rounded-2xl overflow-hidden bg-[#05070E]/90 border border-[#00F0FF]/20 shadow-inner flex flex-col justify-between">
      <div className="flex-1 w-full h-[280px]">
        <Canvas
          camera={{ position: [3.0, 2.0, 3.0], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[5, 5, 5]} intensity={1.6} color="#00F0FF" />
          <pointLight position={[-5, -5, -5]} intensity={1.2} color="#8A2BE2" />

          {/* Translucent Sphere Wireframe */}
          <mesh>
            <sphereGeometry args={[1.6, 32, 24]} />
            <meshStandardMaterial
              color="#0B0F1A"
              wireframe
              transparent
              opacity={0.22}
              roughness={0.8}
            />
          </mesh>

          {/* Equatorial and Meridian Rings */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.595, 1.605, 64]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[1.595, 1.605, 64]} />
            <meshBasicMaterial color="#8A2BE2" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>

          {/* Coordinate Axes */}
          {/* Vertical Y Axis (|0> at top, |1> at bottom) */}
          <Line points={[[0, -1.9, 0], [0, 1.9, 0]]} color="#64748B" lineWidth={1.2} />
          {/* X Axis (|+> at +X, |-> at -X) */}
          <Line points={[[-1.9, 0, 0], [1.9, 0, 0]]} color="#64748B" lineWidth={1.2} />
          {/* Z Axis (|+i> at +Z, |-i> at -Z) */}
          <Line points={[[0, 0, -1.9], [0, 0, 1.9]]} color="#64748B" lineWidth={1.2} />

          {/* State Vector */}
          <VectorArrow theta={theta} phi={phi} />

          {/* Axis State Labels */}
          <Text position={[0, 2.1, 0]} fontSize={0.18} color="#00F0FF" anchorX="center" anchorY="middle">
            |0⟩ (+Z)
          </Text>
          <Text position={[0, -2.1, 0]} fontSize={0.18} color="#8A2BE2" anchorX="center" anchorY="middle">
            |1⟩ (-Z)
          </Text>
          <Text position={[2.1, 0, 0]} fontSize={0.15} color="#38BDF8" anchorX="center" anchorY="middle">
            |+⟩ (+X)
          </Text>
          <Text position={[-2.1, 0, 0]} fontSize={0.15} color="#94A3B8" anchorX="center" anchorY="middle">
            |−⟩ (-X)
          </Text>
          <Text position={[0, 0, 2.1]} fontSize={0.15} color="#A855F7" anchorX="center" anchorY="middle">
            |+i⟩ (+Y)
          </Text>
          <Text position={[0, 0, -2.1]} fontSize={0.15} color="#94A3B8" anchorX="center" anchorY="middle">
            |-i⟩ (-Y)
          </Text>

          {interactive && <OrbitControls enablePan={false} minDistance={2.4} maxDistance={5.8} />}
        </Canvas>
      </div>

      {/* Scientific State Formula Footer */}
      <div className="p-3 bg-[#080C17]/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">STATE:</span>
          <MathFormula
            math={`|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle`}
            color="cyan"
          />
        </div>
        <div className="text-[11px] text-slate-400">
          θ: {(theta).toFixed(2)} rad ({((theta * 180) / Math.PI).toFixed(0)}°) | φ: {(phi).toFixed(2)} rad ({((phi * 180) / Math.PI).toFixed(0)}°)
        </div>
      </div>
    </div>
  );
};

export default BlochSphere3D;
