"use client";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function TreePointCloud({ handPos, isPinching }: { handPos: any, isPinching: boolean }) {
  const count = 15000; 
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create a "target" rotation object to smooth out movements
  const targetRotation = useRef({ y: 0, x: 0 });

  const [particles] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Basic Fractal Tree Math
      const section = Math.floor(i / (count / 5)); // 5 sections of the tree
      const y = (i / count) * 6 - 3; // Height from -3 to 3
      
      // As height (y) increases, branches spread out more
      const spread = (y + 3) * 0.5; 
      const angle = i * 0.2;
      
      positions[i * 3] = Math.cos(angle) * Math.random() * spread;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * Math.random() * spread;
    }
    return [positions];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // 1. SMOOTH ROTATION (Lerp)
    // Instead of +=, we target a specific angle based on hand X
    // HandPos.x is roughly -5 to 5, so we map that to a rotation
    const targetY = handPos.x * 0.5; 
    
    // Smoothly move current rotation towards target (0.1 is the smoothing factor)
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      targetY,
      0.1
    );

    // 2. DISINTEGRATION EFFECT
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (!isPinching) {
        // Slow "float away" effect
        positions[i3] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.003;
        positions[i3 + 1] += Math.cos(state.clock.elapsedTime * 0.5 + i) * 0.003;
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      } else {
        // Optional: Slowly pull points back to original positions here
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.012} 
        color="#ffffff" 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} // This makes it "glow" when dots overlap
        depthWrite={false}
      />
    </points>
  );
}