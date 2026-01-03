import * as THREE from "three";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { CanvasTarget } from "three/webgpu";
import {
  AddAnimation,
  InitRender,
  RemoveAnimation,
  type MultipleRender,
} from "@/lib/globalRenderer";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { getRandomInt } from "@/util/get-random-int";

function CardRender({
  object3d,
  title,
}: {
  object3d: THREE.Object3D;
  title: string;
}) {
  const storeKeyRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const canvasTargetRef = useRef<CanvasTarget | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const initializeScene = useCallback(() => {
    sceneRef.current = new THREE.Scene();
    sceneRef.current.name = title;
    sceneRef.current.add(object3d);

    sceneRef.current.add(
      new THREE.DirectionalLight(new THREE.Color("white"), 1.5)
    );
    sceneRef.current.add(new THREE.AmbientLight());

    cameraRef.current = new THREE.PerspectiveCamera();
    cameraRef.current.position.set(2, 2, 2);
    cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));

    controlsRef.current = new OrbitControls(
      cameraRef.current,
      canvasRef.current
    );

    sceneRef.current.userData.controls = controlsRef.current;

    controlsRef.current.enableZoom = false;
  }, [object3d]);

  useEffect(() => {
    if (!canvasTargetRef.current && canvasRef.current)
      canvasTargetRef.current = new CanvasTarget(canvasRef.current);

    const canvasTarget = canvasTargetRef.current;
    if (!canvasTarget) return;

    if (!sceneRef.current || !cameraRef.current || !controlsRef.current)
      initializeScene();
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const width = wrapperRef.current.offsetWidth;
    const height = wrapperRef.current.offsetHeight;
    InitRender({
      canvasTarget,
      scene,
      camera,
      width,
      height,
    } as MultipleRender);
  }, [initializeScene]);

  const onCanvasControl = useCallback(
    (ev: MouseEvent) => {
      if (!canvasTargetRef.current && canvasRef.current)
        canvasTargetRef.current = new CanvasTarget(canvasRef.current);

      const canvasTarget = canvasTargetRef.current;
      if (!canvasTarget) return;

      if (!sceneRef.current || !cameraRef.current || !controlsRef.current)
        initializeScene();
      if (!sceneRef.current || !cameraRef.current || !controlsRef.current)
        return;

      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const width = wrapperRef.current.offsetWidth;
      const height = wrapperRef.current.offsetHeight;
      const updatables = [controlsRef.current];

      const storeKey = AddAnimation({
        canvasTarget,
        scene,
        camera,
        width,
        height,
        updatables,
      });
      storeKeyRef.current = storeKey;
    },
    [initializeScene]
  );

  const offCanvasControl = useCallback((ev: MouseEvent) => {
    if (storeKeyRef.current) RemoveAnimation(storeKeyRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener("mousedown", onCanvasControl);
    canvas.addEventListener("mouseup", offCanvasControl);

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousedown", onCanvasControl);
        canvas.removeEventListener("mouseup", offCanvasControl);
      }
    };
  }, [onCanvasControl, offCanvasControl]);

  return (
    <>
      <div ref={wrapperRef} className="w-full h-full">
        <canvas className="w-full h-full" ref={canvasRef}></canvas>
      </div>
    </>
  );
}

function CardView({
  object3d,
  title,
}: {
  object3d: THREE.Object3D;
  title: string;
}) {
  return (
    <>
      <div className="w-55 bg-white shadow-md/30">
        <div className="aspect-square m-3 bg-gray-200">
          <CardRender object3d={object3d} title={title} />
        </div>
        <div className="flex mb-3 ml-5 items-start">
          <p className="text-gray-400 text-lg text-center">{title}</p>
        </div>
      </div>
    </>
  );
}

export default function MultipleTab() {
  const meshes = useMemo(() => {
    const geometries = [
      new THREE.BoxGeometry(),
      new THREE.ConeGeometry(1, 1, 16),
      new THREE.CapsuleGeometry(1, 1, 16),
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.TorusGeometry(1, 0.5, 16),
    ];

    const materials = [
      new THREE.MeshStandardMaterial({ color: new THREE.Color("red") }),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("orange") }),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("yellow") }),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("green") }),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("blue") }),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("purple") }),
    ];

    const meshes = [];
    for (let i = 0; i < 50; i++) {
      const randGeom = getRandomInt(geometries.length);
      const randMat = getRandomInt(materials.length);
      const mesh = new THREE.Mesh(geometries[randGeom], materials[randMat]);
      meshes.push(mesh);
    }
    return meshes;
  }, []);

  return (
    <>
      <div className="relative overflow-y-scroll overflow-x-clip block flex flex-wrap content-start p-6 gap-6 w-full h-full">
        {meshes.map((mesh, idx) => (
          <CardView
            key={`card-${idx}`}
            object3d={mesh}
            title={`scene-${idx}`}
          />
        ))}
      </div>
    </>
  );
}
