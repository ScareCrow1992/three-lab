import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
// import {} from "@/shaders/"

import vertexShader from "@/shaders/test/vertex.vert.glsl";
import fragmentShader from "@/shaders/test/fragment.frag.glsl";

function ShaderTest() {
  const refMesh = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (!refMesh.current) return;
    const mesh = refMesh.current;
    const material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // console.log(material);

    mesh.material = material;

    return () => {
      if (!Array.isArray(mesh.material)) mesh.material.dispose();
    };
  }, [refMesh.current]);

  return (
    <>
      <mesh ref={refMesh}>
        <planeGeometry />
      </mesh>
    </>
  );
}

export default function AnimationsTab() {
  return (
    <>
      <div className="relative block w-full h-full">
        <Canvas className="relative block w-full h-full">
          <color attach="background" args={[new THREE.Color("black")]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ShaderTest />

          <OrbitControls />
        </Canvas>
      </div>
    </>
  );
}
