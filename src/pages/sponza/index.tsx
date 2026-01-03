import * as THREE from "three";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { EffectComposer, SMAA } from "@react-three/postprocessing";

function SponzaModel() {
  const gltf = useGLTF("models/sponza/Sponza.gltf");

  gltf.scene.traverse((obj) => {
    if (obj.type === "Mesh") {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = mesh.receiveShadow = true;
    }
  });

  return (
    <>
      <primitive object={gltf.scene} />
    </>
  );
}

export default function SponzaTab() {
  const directionalLight = useMemo(() => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);

    directionalLight.position.set(4, 18, 3);
    directionalLight.target.position.set(0, 7, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.far = 32;
    return directionalLight;
  }, []);

  return (
    <>
      <div className="relative block w-full h-full">
        <Canvas className="relative block w-full h-full" shadows>
          <color attach="background" args={[new THREE.Color(0xeeeeee)]} />
          {/* <SceneRoot /> */}

          <SponzaModel />
          <OrbitControls />
          <primitive object={directionalLight} />
          <ambientLight color={0x929292} />

          <EffectComposer>
            <SMAA />
          </EffectComposer>

          {/* <EffectComposer>
                  <CenterCircle radius={0.09} feather={0.008} opacity={1.0} />
                </EffectComposer> */}
        </Canvas>
      </div>
    </>
  );
}
