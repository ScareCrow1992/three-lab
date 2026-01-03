import * as THREE from "three";
import {
  Box,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { EffectComposer, SMAA } from "@react-three/postprocessing";

function CheckerBoard({
  scene,
  anisotropy,
}: {
  scene: THREE.Scene;
  anisotropy: number;
}) {
  // const texture = useTexture("textures/Black_and_white_checkered_pattern.jpg");
  const texture = useTexture("textures/grid.png").clone();

  texture.repeat.set(16000, 16000);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = anisotropy;

  useEffect(() => {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ map: texture })
    );

    plane.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(plane);

    return () => {
      scene.attach(plane);
      plane.geometry.dispose();
      plane.material.dispose();
      plane.clear();
    };
  }, []);

  return (
    <>
      {/* <Plane scale={[1000, 1000, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial map={texture} />
      </Plane> */}
    </>
  );
}

function Scene({
  scene1,
  scene2,
}: {
  scene1: THREE.Scene;
  scene2: THREE.Scene;
}) {
  const { gl, size, camera } = useThree();

  useFrame(() => {
    // x, y, width, height
    gl.clear();

    gl.setScissorTest(true);

    gl.setScissor(0, 0, size.width / 2 - 2, size.height);
    gl.render(scene1, camera);

    gl.setScissor(size.width / 2 + 2, 0, size.width / 2 - 2, size.height);
    gl.render(scene2, camera);

    gl.setScissorTest(false);
  }, 1);

  return <></>;
}

export default function AnisotropyTab() {
  const { scene1, scene2 } = useMemo(() => {
    const scene1 = new THREE.Scene();
    const scene2 = new THREE.Scene();

    scene1.fog = new THREE.Fog(0xf2f7ff, 1, 2000);
    scene2.fog = new THREE.Fog(0xf2f7ff, 1, 2000);

    const light1 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 3);
    const light2 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 3);

    scene1.add(light1);
    scene2.add(light2);

    return { scene1, scene2 };
  }, []);

  return (
    <>
      <div className="z-100 p-5 absolute left-0 bottom-0 bg-black/50 text-white">
        anisotropy 16
      </div>
      <div className="z-100 p-5 absolute right-0 bottom-0 bg-black/50 text-white">
        anisotropy 1
      </div>

      <div className="relative block w-full h-full">
        <Canvas className="relative block w-full h-full" shadows>
          <color attach="background" args={[new THREE.Color(0xffffff)]} />
          {/* <SceneRoot /> */}
          <OrbitControls />
          {/* <ambientLight color={0x929292} /> */}

          <CheckerBoard scene={scene1} anisotropy={16} />
          <CheckerBoard scene={scene2} anisotropy={1} />

          <Scene scene1={scene1} scene2={scene2} />
          {/* <EffectComposer>
                  <CenterCircle radius={0.09} feather={0.008} opacity={1.0} />
                </EffectComposer> */}
        </Canvas>
      </div>
    </>
  );
}
