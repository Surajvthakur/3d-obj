"use client";
import { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import HandTracker from "@/components/HandTracker";
import TreePointCloud from "@/components/TreePointCloud"
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";


export default function Home() {
  const [handData, setHandData] = useState({ x: 0, y: 0, z: 0, gesture: "UNKNOWN", rawGesture: "UNKNOWN" });

  // Handle the hand coordinates coming from Task 1.2
  const handRef = useRef({ x: 0, y: 0, z: 0, gesture: "UNKNOWN" });

  const handleHandUpdate = (data: any) => {
    // 1. Update the UI state for the debug overlay
    setHandData(data);

    // 2. Update the REF for the animation loop with centered coordinates
    // MediaPipe (0,0) is TOP-LEFT. Canvas (0,0) is CENTER.
    // data.x (0 to 1) -> maps to (-5 to 5)
    handRef.current = {
      x: (data.x - 0.5) * 10,  // Removed negation to match natural movement
      y: (data.y - 0.5) * -10, // Keep Y negated because 0 is Top in web, but +Y is Up in 3D
      z: data.z * -10,
      gesture: data.gesture
    };
  };

  return (
    <main className="w-full h-screen relative">
      {/* 1. The 3D Layer */}
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={1} />

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
        <p>Pinch fingers to spread tree • Make fist to collapse • Open hand for natural</p>
        <p>X: {handData.x.toFixed(2)} | Y: {handData.y.toFixed(2)}</p>
        <p className={`font-bold ${
          handData.gesture === 'PINCH' ? 'text-blue-500' :
          handData.gesture === 'FIST' ? 'text-red-500' :
          handData.gesture === 'OPEN' ? 'text-green-500' :
          'text-yellow-500'
        }`}>
          GESTURE: {handData.gesture || 'UNKNOWN'}
        </p>
        <p className="text-sm text-gray-400">
          Raw: {handData.rawGesture || 'UNKNOWN'} | Stable: {handData.gesture || 'UNKNOWN'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Debug: Make a tight fist with all fingers curled toward palm
        </p>
      </div>
    </main>
  );
} 