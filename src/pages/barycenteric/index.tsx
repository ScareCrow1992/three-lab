import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

import vertexShader from "@/shaders/3.00/barycentric/blending/center-blending.geo.glsl";
import fragmentShader from "@/shaders/3.00/barycentric/blending/center-blending.frag.glsl";
import { BarycentricUI } from "./ui";

function SimplePolygon() {
  const { scene } = useThree();

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

    // const material = new THREE.MeshBasicMaterial();
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      glslVersion: THREE.GLSL3,
    });

    const mesh = new THREE.Mesh(bufferGeo, material);
    scene.add(mesh);

    return () => {
      mesh.remove(mesh);
      bufferGeo.dispose();
      material.dispose();
    };
  }, [scene]);

  return null;
}

export function BaryCentricTab() {
  return (
    <div className="relative block w-full h-full">
      <div className="absolute left-4 top-4 bg-white w-[40px] h-[40px] z-10">
        <BarycentricUI />
      </div>
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
        <SimplePolygon />
      </Canvas>
    </div>
  );
}
