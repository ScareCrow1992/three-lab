import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { InstancedMesh } from "./render/instanced-mesh";
import { usePickingStore } from "./store/picking.store";
import { useShallow } from "zustand/shallow";
import * as THREE from "three";

function InteractionResult() {
  const { pickingId, rayCastId } = usePickingStore(
    useShallow((s) => ({ pickingId: s.pickingId, rayCastId: s.rayCastId })),
  );

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
      <div className="relative bg-black/60 text-white p-2">
        <div>pickingId: {pickingId}</div>
        <div>rayCastId: {rayCastId}</div>
      </div>
    </div>
  );
}

export default function PickingTab() {
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
        <Grid
          infiniteGrid={false}
          cellSize={1}
          sectionSize={0.1}
          sectionColor={"#dddddd"}
          args={[200, 200]}
          layers={0}
        />
        {/*         <Plane
          // layers={1 << 10} //
          layers={10}
          position={[0, 2, 0]}
          args={[10, 10]}
          rotation={[-Math.PI / 2, 0, 0]}
        /> */}
        {/* <Box args={[4, 4, 4]} position = {[]} /> */}
        <InstancedMesh />
      </Canvas>
      <InteractionResult />
    </div>
  );
}
