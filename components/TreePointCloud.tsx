"use client";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function TreePointCloud({ handRef }: { handRef: React.MutableRefObject<any> }) {
  const count = 10000;
  const pointsRef = useRef<THREE.Points>(null);

  // Store the "Home" positions permanently
  const initialPositions = useMemo(() => {
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

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Access hand data directly from the REF
    const { x, isPinching } = handRef.current;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    // 1. Rotation Logic (Smoothed)
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y, 
      x * 0.5, 
      0.05
    );

    // 2. Particle Logic
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const hX = initialPositions[i3];
      const hY = initialPositions[i3 + 1];
      const hZ = initialPositions[i3 + 2];

      if (isPinching) {
        // Return to Home
        positions[i3] = THREE.MathUtils.lerp(positions[i3], hX, 0.1);
        positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1], hY, 0.1);
        positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2], hZ, 0.1);
      } else {
        // Slow Drifting
        const drift = Math.sin(time * 0.5 + i) * 0.2;
        positions[i3] = THREE.MathUtils.lerp(positions[i3], hX + drift, 0.02);
        positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1], hY + drift, 0.02);
        positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2], hZ + drift, 0.02);
      }
    }
    
    // CRITICAL: Tell Three.js the points moved
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={initialPositions.slice()}
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