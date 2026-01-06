"use client";
import { useState, useRef} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import HandTracker from "@/components/HandTracker";
import Stage from "@/components/Stage"
import TreePointCloud from "@/components/TreePointCloud"
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";

// This is a temporary 3D object to test tracking
function TestCube({ position, isPinching }: { position: [number, number, number], isPinching: boolean }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={isPinching ? "#00ff00" : "#ff0000"} />
    </mesh>
  );
}

export default function Home() {
  const [handData, setHandData] = useState({ x: 0, y: 0, z: 0, isPinching: false });

  // Handle the hand coordinates coming from Task 1.2
  const handRef = useRef({ x: 0, y: 0, z: 0, isPinching: false });

  const handleHandUpdate = (data: any) => {
    // Directly update the REF, not the STATE for the animation loop
    handRef.current = {
      x: (data.x - 0.5) * -10,
      y: (data.y - 0.5) * -10,
      z: data.z * -10,
      isPinching: data.isPinching
    };
  };

  return (
    <main className="w-full h-screen relative">
      {/* 1. The 3D Layer */}
      // Inside your Canvas in page.tsx
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={1} />
        
        <Stage />
        <TreePointCloud handRef={handRef} />
        <EffectComposer>
        <Bloom 
          intensity={1.5} 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          mipmapBlur 
        />
        <Noise opacity={0.05} /> 
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      </Canvas>

      {/* 2. The AI Tracker Layer */}
      <HandTracker onHandUpdate={handleHandUpdate} />
      {/* Social Overlay */}
<div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-10 select-none">

  {/* Bottom Center: Song Title */}
  <div className="flex flex-col items-center mb-10">
    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
      <span className="text-white text-sm font-medium">
        Massive Attack • Angel (Remastered)
      </span>
    </div>
  </div>
</div>

      {/* 3. UI Overlay */}
      <div className="absolute top-10 left-10 text-white font-mono pointer-events-none">
        <h1 className="text-2xl font-bold">PHASE 1: HAND CALIBRATION</h1>
        <p>Pinch fingers to turn cube GREEN</p>
        <p>X: {handData.x.toFixed(2)} | Y: {handData.y.toFixed(2)}</p>
      </div>
    </main>
  );
} 