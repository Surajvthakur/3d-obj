"use client";
import React, { useRef, useEffect } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';

export default function HandTracker({ onHandUpdate }: { onHandUpdate: (data: any) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarker = useHandTracking();

  useEffect(() => {
    async function startCamera() {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
    }

    async function predictWebcam() {
      if (landmarker.current && videoRef.current) {
        const results = landmarker.current.detectForVideo(videoRef.current, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
          const hand = results.landmarks[0];
          // Landmark 4 = Thumb Tip, Landmark 8 = Index Tip
          const thumb = hand[4];
          const index = hand[8];
          
          // Calculate distance for pinch gesture
          const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) + 
            Math.pow(thumb.y - index.y, 2)
          );

          onHandUpdate({
            x: index.x, // Horizontal position
            y: index.y, // Vertical position
            z: index.z, // Depth
            isPinching: distance < 0.05 // True if fingers are close
          });
        }
        requestAnimationFrame(predictWebcam);
      }
    }

    startCamera();
  }, [landmarker]);

  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline 
      className="fixed bottom-4 right-4 w-48 h-36 rounded-lg border-2 border-white mirror"
      style={{ transform: 'scaleX(-1)' }} // Mirror the video for natural movement
    />
  );
}