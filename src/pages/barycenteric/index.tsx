import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";

import { BarycentricUI } from "./ui";
import { useBarycentricMaterial } from "./matarials";

function SimplePolygon() {
  const { scene } = useThree();

  const [geometry, setGeometry] = useState<THREE.BufferGeometry>(null!);

  useEffect(() => {
    const bufferGeo = new THREE.BufferGeometry();

    // center
    const positionArr = [0, 0, 1, 0.866, 0, -0.5, -0.866, 0, -0.5];
    const positionData = new Float32Array(positionArr);
    const positionAttribute = new THREE.BufferAttribute(positionData, 3, true);
    bufferGeo.setAttribute("position", positionAttribute);

    // barycenteric
    const centerA = [1, 0, 0];
    const centerB = [0, 1, 0];
    const centerC = [0, 0, 1];
    const center = [...centerA, ...centerB, ...centerC];
    const centerData = new Float32Array(center);
    const centerAttribute = new THREE.BufferAttribute(centerData, 3);
    bufferGeo.setAttribute("center", centerAttribute);

    // id(flat)
    const idArray = [0, 1, 2];
    const idData = new Uint32Array(idArray);
    const idAttribute = new THREE.BufferAttribute(idData, 3);
    bufferGeo.setAttribute("vertexIds", idAttribute);

    // index
    const indexArr = [0, 1, 2];
    const indexData = new Uint16Array(indexArr);
    const indexAttribute = new THREE.BufferAttribute(indexData, 1, false);
    bufferGeo.setIndex(indexAttribute);

    setGeometry(bufferGeo);

    return () => {
      bufferGeo.dispose();
    };
  }, [setGeometry]);

  const material = useBarycentricMaterial();

  useEffect(() => {
    let mesh: THREE.Mesh | null = null;
    if (geometry && material) {
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    }

    return () => {
      if (mesh) scene.remove(mesh);
    };
  }, [scene, geometry, material]);

  return null;
}

export function BaryCentricTab() {
  return (
    <div className="relative isolate block w-full h-full">
      <Canvas
        className="relative z-0 block w-full h-full"
        shadows
        gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 5, -5], fov: 45 }}
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
        <SimplePolygon />
      </Canvas>
      <div className="absolute left-4 top-4 z-10 rounded-md border-2 bg-white">
        <BarycentricUI />
      </div>
    </div>
  );
}
