import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function BarnLampTab() {
  return (
    <>
      <div className="relative block w-full h-full">
        <Canvas className="relative block w-full h-full" shadows>
          <color attach="background" args={[new THREE.Color(0xffffff)]} />
          {/* <SceneRoot /> */}
          <OrbitControls />
          {/* <ambientLight color={0x929292} /> */}

          {/* <EffectComposer>
                  <CenterCircle radius={0.09} feather={0.008} opacity={1.0} />
                </EffectComposer> */}
        </Canvas>
      </div>
    </>
  );
}
