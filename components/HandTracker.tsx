"use client";
import React, { useRef, useEffect } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';

function isFingerExtended(tip: any, pip: any) {
  return tip.y < pip.y;
}

function detectGesture(hand: any) {
  const thumbExtended = isFingerExtended(hand[4], hand[3]);
  const indexExtended = isFingerExtended(hand[8], hand[6]);
  const middleExtended = isFingerExtended(hand[12], hand[10]);
  const ringExtended = isFingerExtended(hand[16], hand[14]);
  const pinkyExtended = isFingerExtended(hand[20], hand[18]);

  const fingers = [
    thumbExtended,
    indexExtended,
    middleExtended,
    ringExtended,
    pinkyExtended,
  ];

  // 🤏 Pinch
  const pinchDistance = Math.hypot(
    hand[4].x - hand[8].x,
    hand[4].y - hand[8].y,
    hand[4].z - hand[8].z
  );

  if (pinchDistance < 0.07) return "PINCH";

  // ✊ Fist
  if (fingers.every((f) => !f)) return "FIST";

  // ✋ Open hand
  if (fingers.every((f) => f)) return "OPEN";

  return "UNKNOWN";
}

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

          // Calculate 3D distance for pinch gesture
          const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) +
            Math.pow(thumb.y - index.y, 2) +
            Math.pow(thumb.z - index.z, 2)
          );

          const gesture = detectGesture(hand);

          onHandUpdate({
            x: index.x,
            y: index.y,
            z: index.z,
            gesture,
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