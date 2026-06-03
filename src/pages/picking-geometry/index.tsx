import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { PickingGeometry } from "./render/picking-geometry";

export default function PickingGeometryTab() {
  return (
    <div className="relative block w-full h-full">
      <Canvas
        className="relative block w-full h-full"
        shadows
        gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={["black"]} />
        <OrbitControls enablePan={false} />
        <PerspectiveCamera
          position={[10, 10, 10]}
          rotation={[Math.PI / 4, 0, 0]}
        />
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={1.5}
          position={[1, 1, 0.5]}
          lookAt={[0, 0, 0]}
        />
        <PickingGeometry />
      </Canvas>
    </div>
  );
}
