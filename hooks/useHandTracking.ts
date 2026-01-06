import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const useHandTracking = () => {
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const setupLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `/models/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
    };

    setupLandmarker();
  }, []);

  return landmarkerRef;
};