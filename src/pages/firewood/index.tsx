import { ktx2loader } from "@/loader/gltf-loader";
import { useGLTFExtended } from "@/shared/hooks/use-gltf-extended";
import { Box, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { GLTFLoader, type GLTF } from "three-stdlib";

import * as THREE from "three";
import { createProceduralWoodLog } from "@/shared/geometry/procedular-woodlog";
import { textureLoader } from "@/loader/loader";
import { toneMapping } from "three/src/nodes/TSL.js";
import { createWindGrass, type WindGrass } from "@/shared/models/wind-grass";
import {
  createFirewoodPostprocessing,
  type FirewoodPostprocessing,
} from "./postprocessing";
import { useBokehIgnoreStore } from "./use-bokeh-ignore.store";
import { useShallow } from "zustand/shallow";
import { applyGoboLuminanceAlphaMask } from "./gobo-alpha-mask";

function GoboMesh() {
  const { gl, scene } = useThree();
  // const addBokehIgnore = useBokehIgnoreStore((state) => state.add);
  // const removeBokehIgnore = useBokehIgnoreStore((state) => state.remove);

  const refInit = useRef<boolean>(false);
  const [colorMaterial, setColorMaterial] =
    useState<THREE.MeshBasicMaterial | null>(null);

  const [depthMaterial, setDepthMaterial] =
    useState<THREE.MeshBasicMaterial | null>(null);

  useEffect(() => {
    if (refInit.current) return;

    refInit.current = true;

    const video = document.createElement("video");
    video.src = "video/gobo.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = `anonymous`;

    video.addEventListener("loadeddata", () => {
      video.play();
    });

    video.load();

    const videoTexture = new THREE.VideoTexture(video);

    videoTexture.colorSpace = THREE.SRGBColorSpace;

    const colorMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const depthMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

    colorMaterial.onBeforeCompile = applyGoboLuminanceAlphaMask;
    depthMaterial.onBeforeCompile = applyGoboLuminanceAlphaMask;

    setColorMaterial(colorMaterial);
    setDepthMaterial(depthMaterial);
  }, [gl, setColorMaterial, setDepthMaterial]);

  useEffect(() => {
    if (!colorMaterial || !depthMaterial) return;

    const geometry = new THREE.PlaneGeometry(10, 10);
    const mesh = new THREE.Mesh(geometry, colorMaterial);

    mesh.customDepthMaterial = depthMaterial;
    mesh.visible = true;
    mesh.receiveShadow = false;
    mesh.castShadow = true;
    mesh.material.colorWrite = false;

    mesh.position.set(-1, 3.5, 1); // -2, 3, 2
    mesh.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(mesh);
    // addBokehIgnore(mesh);

    return () => {
      // removeBokehIgnore(mesh);
      scene.remove(mesh);
      geometry.dispose();
    };
  }, [colorMaterial, depthMaterial, scene]);

  return null;
}

function StumpModel() {
  const { gl } = useThree();
  const stump = useGLTFExtended(
    "models/stump/stump_v02_mesh_warm_ktx2_2048.glb",
    gl,
  );

  const mesh = useMemo(() => {
    stump.scene.traverse((obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (obj.type === "Mesh") {
        const mesh = obj as THREE.Mesh;
        if (
          !Array.isArray(mesh.material) &&
          mesh.material.type === "MeshStandardMaterial"
        ) {
          let t = mesh.material as THREE.MeshStandardMaterial;
          // console.log(t);

          if (t.map) t.map.colorSpace = THREE.SRGBColorSpace;

          if (t.emissiveMap) t.emissiveMap.colorSpace = THREE.SRGBColorSpace;

          t.color.set(16777215);
          t.roughness = Math.max(t.roughness, 0.7);
          t.metalness = 0;
        }
      }
    });

    return stump.scene.clone();
  }, [stump]);

  return <primitive object={mesh} />;
}

async function createFirewoodMaterials(renderer: THREE.WebGLRenderer) {
  const promTexInsideNorm = textureLoader.loadAsync(
    "models/firewood/insidegrain_n.jpg",
  );
  const promTexInside = textureLoader.loadAsync(
    "models/firewood/insidegrain.jpg",
  );
  const promTexTopNorm = textureLoader.loadAsync("models/firewood/top_n.jpg");
  const promTexTop = textureLoader.loadAsync("models/firewood/top.jpg");
  const promTexOutsideNorm = textureLoader.loadAsync(
    "models/firewood/outsidebark_n.jpg",
  );
  const promTexOutside = textureLoader.loadAsync(
    "models/firewood/outsidebark.jpg",
  );

  const textures = await Promise.all([
    promTexInside,
    promTexInsideNorm,
    promTexTop,
    promTexTopNorm,
    promTexOutside,
    promTexOutsideNorm,
  ]);
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace; // 컬러 텍스처만
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // 반복 텍스처만
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  });

  const [
    insideGrainTexture,
    insideGrainNormalTexture,
    topTexture,
    topNormalTexture,
    outsideBarkTexture,
    outsideBarkNormalTexture,
  ] = textures;

  // 노말맵은 color space를 적용하면 안됨
  insideGrainNormalTexture.colorSpace = THREE.NoColorSpace;
  topNormalTexture.colorSpace = THREE.NoColorSpace;
  outsideBarkNormalTexture.colorSpace = THREE.NoColorSpace;

  const sideMaterial = new THREE.MeshStandardMaterial({
    map: outsideBarkTexture,
    normalMap: outsideBarkNormalTexture,
    normalScale: new THREE.Vector2(2, 2),
    roughness: 0.7,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  const topMaterial = new THREE.MeshStandardMaterial({
    map: topTexture,
    normalMap: topNormalTexture,
    normalScale: new THREE.Vector2(1.5, 1.5),
    roughness: 0.7,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  const innerMaterial = new THREE.MeshStandardMaterial({
    map: insideGrainTexture,
    normalMap: insideGrainNormalTexture,
    normalScale: new THREE.Vector2(1.5, 1.5),
    roughness: 0.7,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  return { sideMaterial, topMaterial, innerMaterial };
}

async function createFirewood(renderer: THREE.WebGLRenderer) {
  const {
    sideMaterial: side,
    topMaterial: top,
    innerMaterial: inner,
  } = await createFirewoodMaterials(renderer);

  return createProceduralWoodLog(side, top, inner);
}

function FireWood() {
  const { gl, scene } = useThree();
  const refBool = useRef<boolean>(false);

  useEffect(() => {
    if (refBool.current) return;
    refBool.current = true;

    createFirewood(gl).then((wood) => {
      wood.mesh.position.set(0, 0.155, 0);
      scene.add(wood.mesh);
    });

    return;
  }, [gl, scene]);

  return null;
}

function WindGrassModel() {
  const { scene } = useThree();
  const [windGrass, setWindGrass] = useState<WindGrass | null>(null);

  const { addBokehIgnore, removeBokehIgnore } = useBokehIgnoreStore(
    useShallow((s) => ({
      addBokehIgnore: s.add,
      removeBokehIgnore: s.remove,
    })),
  );

  useEffect(() => {
    const windGrass = createWindGrass(scene);
    setWindGrass((prev) => {
      if (prev) {
        prev.dispose();
        removeBokehIgnore(prev.mesh);
      }

      addBokehIgnore(windGrass.mesh);
      return windGrass;
    });
  }, [scene, setWindGrass, addBokehIgnore, removeBokehIgnore]);

  useFrame((state, delta, frame) => {
    windGrass?.update(delta);
  });

  return null;
}

function PostProcessor() {
  const { size, gl, scene, camera } = useThree();
  const bokehIgnores = useBokehIgnoreStore((state) => state.ignores);
  const [postProcessor, setPostProcessor] =
    useState<FirewoodPostprocessing | null>(null);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      return;
    }

    const renderer = gl;
    const postProcessor = createFirewoodPostprocessing(
      renderer,
      scene,
      camera,
      {
        excludeFromBokeh: bokehIgnores,
      },
    );

    setPostProcessor((prev) => {
      if (prev) prev.dispose();
      return postProcessor;
    });
  }, [bokehIgnores, gl, scene, camera, setPostProcessor]);

  useEffect(() => {
    if (postProcessor) postProcessor.setSize(size.width, size.height);
  }, [size, postProcessor]);

  useFrame(() => {
    if (postProcessor) postProcessor.render();
  }, 1);

  return null;
}

export default function FireWoodTab() {
  return (
    <>
      <div className="relative block w-full h-full">
        <Canvas
          className="relative block w-full h-full"
          shadows={{
            enabled: true,
            type: THREE.PCFSoftShadowMap,
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.NeutralToneMapping,
            toneMappingExposure: 1,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          camera={{
            fov: 55,
            near: 0.01,
            far: 100,
          }}
        >
          <directionalLight
            color={"#fff2cc"}
            intensity={4}
            position={[-3.464, 4.0, 6.0]}
            lookAt={[0, 0, 0]}
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-camera-near={0.1}
            shadow-camera-far={50}
            shadow-bias={0}
            shadow-normalBias={0.005}
            shadow-radius={4}
            shadow-blurSamples={8}
          />
          {/* <Box /> */}
          <OrbitControls />
          <ambientLight intensity={2} color={"#bad8ff"} />
          <StumpModel />
          <FireWood />
          <GoboMesh />
          <WindGrassModel />
          <PostProcessor />
        </Canvas>
      </div>
    </>
  );
}
