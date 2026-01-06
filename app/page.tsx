"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import HandTracker from "@/components/HandTracker";
import Stage from "@/components/Stage"
import TreePointCloud from "@/components/TreePointCloud"

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
  const handleHandUpdate = (data: any) => {
    // MediaPipe: 0 (left) to 1 (right)
    // We want: -5 (left) to 5 (right) for Three.js
    
    // 1. Center the coordinate: (data.x - 0.5) makes it -0.5 to 0.5
    // 2. Scale it: * 10 makes it -5 to 5
    // 3. Mirror it: * -1 because webcams are usually mirrored
    const threeX = (data.x - 0.5) * -10; 
    
    // Same for Y: MediaPipe 0 is top, 1 is bottom. 
    // Three.js 0 is middle, positive is up.
    const threeY = (data.y - 0.5) * -10; 
  
    setHandData({
      x: threeX,
      y: threeY,
      z: (data.z * -10), // Depth mapping
      isPinching: data.isPinching
    });
  };

  return (
    <main className="w-full h-screen relative">
      {/* 1. The 3D Layer */}
      // Inside your Canvas in page.tsx
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={1} />
        
        <Stage />
        <TreePointCloud handPos={handData} isPinching={handData.isPinching} />
      </Canvas>

      {/* 2. The AI Tracker Layer */}
      <HandTracker onHandUpdate={handleHandUpdate} />

      {/* 3. UI Overlay */}
      <div className="absolute top-10 left-10 text-white font-mono pointer-events-none">
        <h1 className="text-2xl font-bold">PHASE 1: HAND CALIBRATION</h1>
        <p>Pinch fingers to turn cube GREEN</p>
        <p>X: {handData.x.toFixed(2)} | Y: {handData.y.toFixed(2)}</p>
      </div>
    </main>
  );
}