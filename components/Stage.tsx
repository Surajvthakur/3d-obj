import { Edges } from "@react-three/drei";

export default function Stage() {
  return (
    <group>
      {/* The Wireframe Bounding Box */}
      <mesh>
        <boxGeometry args={[4, 4, 4]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges
          threshold={15}
          color="#ffffff"
          thickness={2}
        />
      </mesh>

      {/* Subtle floor grid for depth perception */}
      <gridHelper args={[10, 10, 0x444444, 0x222222]} position={[0, -2, 0]} />
    </group>
  );
}