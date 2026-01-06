"use client";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function TreePointCloud({
  handRef,
}: {
  handRef: React.MutableRefObject<any>;
}) {
  const count = 10000;
  const pointsRef = useRef<THREE.Points>(null);

  // 🔒 PERMANENT HOME POSITIONS (NEVER MUTATED)
  const homePositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const h = (Math.random() - 0.5) * 4;
      const radius = Math.max(0.05, 1.0 - (h + 2) * 0.2);
      const theta = Math.random() * Math.PI * 2;

      pos[i * 3] = radius * Math.cos(theta);
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = radius * Math.sin(theta);
    }
    return pos;
  }, []);

  // 🔁 LIVE POSITIONS (THIS ONE MOVES)
  const livePositions = useMemo(
    () => new Float32Array(homePositions),
    [homePositions]
  );

  useFrame((state) => {
    if (!pointsRef.current) return;

    const { x = 0, isPinching = false } = handRef.current || {};
    const positions =
      pointsRef.current.geometry.attributes.position
        .array as Float32Array;

    // Smooth rotation
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      x * 0.5,
      0.05
    );

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const hx = homePositions[i3];
      const hy = homePositions[i3 + 1];
      const hz = homePositions[i3 + 2];

      if (isPinching) {
        const spread = 2.5;
        positions[i3] = THREE.MathUtils.lerp(positions[i3], hx * spread, 0.1);
        positions[i3 + 1] = THREE.MathUtils.lerp(
          positions[i3 + 1],
          hy * spread,
          0.1
        );
        positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2], hz * spread, 0.1);
      } else {
        // ✅ RETURNS PERFECTLY
        positions[i3] = THREE.MathUtils.lerp(positions[i3], hx, 0.08);
        positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1], hy, 0.08);
        positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2], hz, 0.08);
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={livePositions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
