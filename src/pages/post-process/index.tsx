import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { CenterCircle } from "./center-circle-effect";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outline } from "./outline";

function PostProcess({ selected }: { selected: THREE.Object3D[] }) {
  return (
    <>
      <EffectComposer autoClear={false}>
        <Outline
          selection={selected}
          edgeStrength={7}
          pulseSpeed={0.5}
          blur={true}
          visibleEdgeColor={0x00ff00}
          hiddenEdgeColor={0x00ff00}
        />
        {/* 다른 효과들… */}
      </EffectComposer>
    </>
  );
}

function SceneRoot() {
  const refInstsancedMesh = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    console.log(refInstsancedMesh.current);
    refInstsancedMesh.current.setMatrixAt(
      0,
      new THREE.Matrix4().setPosition(1, 0, 3)
    );

    refInstsancedMesh.current.setMatrixAt(
      1,
      new THREE.Matrix4().setPosition(3, 0, 3)
    );

    refInstsancedMesh.current.setMatrixAt(
      2,
      new THREE.Matrix4().setPosition(5, 0, 3)
    );

    refInstsancedMesh.current.setMatrixAt(
      3,
      new THREE.Matrix4().setPosition(7, 0, 3)
    );

    const selectedArray = new Float32Array([0, 1.0, 0, 1.0]);
    const BufferAttribute = new THREE.BufferAttribute(selectedArray, 1);
    refInstsancedMesh.current.geometry.setAttribute(
      "selected",
      BufferAttribute
    );
  }, [refInstsancedMesh.current]);

  const { geometry, material } = useMemo(() => {
    return {
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: new THREE.MeshStandardMaterial({ color: "white" }),
    };
  }, []);

  const refMesh = useRef<THREE.Mesh>(null!);

  const [selected, setSelected] = useState<THREE.Object3D[]>([]);

  useEffect(() => {
    setSelected([refInstsancedMesh.current]);
  }, [refInstsancedMesh.current]);

  return (
    <>
      <instancedMesh ref={refInstsancedMesh} args={[geometry, material, 4]} />
      <mesh ref={refMesh} position={[1, 0, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
      <mesh position={[1, 0, -1]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial color={"blue"} />
      </mesh>
      <mesh position={[-1, 0, 1]}>
        <coneGeometry args={[0.75, 1.75, 16]} />
        <meshStandardMaterial color={"yellow"} />
      </mesh>
      <mesh position={[-1, 0, -1]}>
        <capsuleGeometry args={[0.75, 1, 16]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
      <PostProcess selected={selected} />
    </>
  );
}

export default function PostProcessTab() {
  return (
    <>
      <div className="relative block w-full h-full">
        <Canvas className="relative block w-full h-full">
          <color attach="background" args={[new THREE.Color("black")]} />
          <ambientLight intensity={0.5} />
          <SceneRoot />
          <OrbitControls />
          <directionalLight
            intensity={1.5}
            position={[1, 1, 0.5]}
            lookAt={[0, 0, 0]}
          />

          {/* <EffectComposer>
            <CenterCircle radius={0.09} feather={0.008} opacity={1.0} />
          </EffectComposer> */}
        </Canvas>
      </div>
    </>
  );
}
