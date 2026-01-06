"use client";
import React, { useRef, useEffect } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';

// Improved finger extension detection
function isFingerExtended(tip: any, pip: any, mcp: any) {
  // In MediaPipe, Y increases downward from top of image
  // A finger is extended if tip is below pip (higher Y value)
  const tipToPipDistance = tip.y - pip.y;
  const pipToMcpDistance = pip.y - mcp.y;
  // Finger is extended if tip extends at least 50% of the distance from pip to mcp
  return tipToPipDistance > pipToMcpDistance * 0.5;
}

function detectGesture(hand: any) {
  const thumbExtended = isFingerExtended(hand[4], hand[3], hand[2]);
  const indexExtended = isFingerExtended(hand[8], hand[6], hand[5]);
  const middleExtended = isFingerExtended(hand[12], hand[10], hand[9]);
  const ringExtended = isFingerExtended(hand[16], hand[14], hand[13]);
  const pinkyExtended = isFingerExtended(hand[20], hand[18], hand[17]);

  const fingers = [
    thumbExtended,
    indexExtended,
    middleExtended,
    ringExtended,
    pinkyExtended,
  ];

  // 🤏 Pinch detection with improved threshold
  const pinchDistance = Math.hypot(
    hand[4].x - hand[8].x,
    hand[4].y - hand[8].y,
    hand[4].z - hand[8].z
  );

  // More generous pinch threshold and check that only thumb and index are close
  if (pinchDistance < 0.08) {
    return "PINCH";
  }

  // ✊ Fist detection: check if finger tips are close to palm center
  // Calculate palm center (average of MCP joints)
  const palmCenterX = (hand[2].x + hand[5].x + hand[9].x + hand[13].x + hand[17].x) / 5;
  const palmCenterY = (hand[2].y + hand[5].y + hand[9].y + hand[13].y + hand[17].y) / 5;

  // Check if most finger tips are close to palm center
  const fingerTips = [hand[4], hand[8], hand[12], hand[16], hand[20]];
  let fingersNearPalm = 0;

  fingerTips.forEach(tip => {
    const distanceToPalm = Math.hypot(
      tip.x - palmCenterX,
      tip.y - palmCenterY
    );
    if (distanceToPalm < 0.15) { // Finger tip is close to palm
      fingersNearPalm++;
    }
  });

  if (fingersNearPalm >= 4) { // At least 4 fingers curled into fist
    return "FIST";
  }

  // ✋ Open hand: most fingers extended
  const extendedFingers = fingers.filter(f => f).length;
  if (extendedFingers >= 4) { // At least 4 fingers extended
    return "OPEN";
  }

  return "UNKNOWN";
}

export default function HandTracker({ onHandUpdate }: { onHandUpdate: (data: any) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarker = useHandTracking();

  // Gesture hysteresis to prevent flickering
  const currentGestureRef = useRef("UNKNOWN");
  const gestureConfidenceRef = useRef(0);

  // Hysteresis function to prevent gesture flickering
  function applyGestureHysteresis(newGesture: string): string {
    const currentGesture = currentGestureRef.current;
    let confidence = gestureConfidenceRef.current;

    if (newGesture === currentGesture) {
      // Same gesture detected, increase confidence
      confidence = Math.min(confidence + 1, 5);
    } else {
      // Different gesture detected, decrease confidence
      confidence = Math.max(confidence - 1, 0);

      // Only change gesture if confidence drops to zero
      if (confidence === 0) {
        currentGestureRef.current = newGesture;
        gestureConfidenceRef.current = 1;
        return newGesture;
      }
    }

    gestureConfidenceRef.current = confidence;
    return currentGesture;
  }

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
          const index = hand[8];

          const rawGesture = detectGesture(hand);
          const stableGesture = applyGestureHysteresis(rawGesture);

          onHandUpdate({
            x: index.x,
            y: index.y,
            z: index.z,
            gesture: stableGesture,
            rawGesture: rawGesture,
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