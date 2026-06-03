import { useFrame, useThree, type Size } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
// import vertexShader from "@/shaders/1.00/picking/picking.geo.glsl";
// import fragmentShader from "@/shaders/1.00/picking/picking.frag.glsl";

import vertexShader300 from "@/shaders/3.00/picking/picking.geo.glsl";
import fragmentShader300 from "@/shaders/3.00/picking/picking.frag.glsl";

import { usePickingStore } from "../store/picking.store";
import { useShallow } from "zustand/shallow";
import { pickRender } from "../util/pick-render";

const PICKING_LAYER = 10;
const WIDTH_CNT = 256;
const HEIGHT_CNT = 256;

function prevRender(
  targets: THREE.Object3D[],
  pickingMaterial: THREE.Material,
) {
  const dictMat = new Map<string, TMaterialRestore>();
  targets.forEach((target) => {
    target.traverse((obj3d) => {
      if (obj3d.type === "Mesh") {
        const mesh = obj3d as THREE.Mesh;
        if (!Array.isArray(mesh.material)) {
          const material = mesh.material;
          const key = obj3d.uuid;
          const layers = obj3d.layers.mask;

          dictMat.set(key, { mesh, material, layers });
          mesh.material = pickingMaterial;
          obj3d.layers.mask = layers | (1 << PICKING_LAYER);
        }
      }
    });
  });

  return dictMat;
}

function postRender(dictMat: Map<string, TMaterialRestore>) {
  dictMat.forEach((value) => {
    const { mesh, material, layers } = value;
    mesh.material = material;
    mesh.layers.mask = layers;
  });
}

function rayCast(
  ndcX: number,
  ndcY: number,
  target: THREE.Object3D,
  camera: THREE.Camera,
) {
  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
  rayCaster.near = 0;
  rayCaster.far = 100000;

  const intersect = rayCaster.intersectObject(target);
  if (intersect.length > 0) {
    return intersect[0].instanceId! + 1;
  } else {
    return 0;
  }
  // console.log(intersect);
}

// id : integer
function convertInt2Color(id: number) {
  const red = ((id >> 16) & 0xff) / 255;
  const green = ((id >> 8) & 0xff) / 255;
  const blue = ((id >> 0) & 0xff) / 255;

  return [red, green, blue];
}

// r,g,b : 0~1
function convertColor2Int(r: number, g: number, b: number) {
  const red = r << 16;
  const green = g << 8;
  const blue = b;

  const id = red | green | blue;

  return id;
}

// async function pickingCheck(gl: THREE.WebGLRenderer) {}

function onPointerDown(event: PointerEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ndcX = (x / rect.width) * 2 - 1;
  const ndcY = -(y / rect.height) * 2 + 1;

  return { ndcX, ndcY };
}

// ndcX, ndcY : -1 ~ 1
// ndcX- : 좌측
// ndcX+ : 우측
// ndcY- : 하단
// ndcY+ : 상단

// width, height : pixelRatio가 적용된 화면 너비, 높이
function getPointerPosition(
  ndcX: number,
  ndcY: number,
  width: number,
  height: number,
) {
  const xRate = (ndcX + 1) / 2;
  const yRate = (ndcY + 1) / 2;

  const pointX = Math.floor(width * xRate);
  const pointY = Math.floor(height * yRate);

  return { pointX, pointY };
}

function useCanvasInteraction(
  gl: THREE.WebGLRenderer,
  size: Size,
  scene: THREE.Scene,
  camera: THREE.Camera,
  pickingTargets: THREE.Object3D[],
  pickingMaterial: THREE.Material,
) {
  const { setPickingId, setRayCastId } = usePickingStore(
    useShallow((s) => ({
      setPickingId: s.setPickingId,
      setRayCastId: s.setRayCastId,
    })),
  );

  const onClick = useCallback(
    async (e: PointerEvent) => {
      const canvas = gl.domElement;
      const { ndcX, ndcY } = onPointerDown(e, canvas);

      if (pickingTargets.length > 0) {
        const rayCastId = rayCast(ndcX, ndcY, pickingTargets[0], camera);
        setRayCastId(rayCastId);
      }

      const pixelRatio = gl.getPixelRatio();

      const width = Math.floor(size.width * pixelRatio);
      const height = Math.floor(size.height * pixelRatio);

      const pointerPosition = getPointerPosition(ndcX, ndcY, width, height);
      const pointX = THREE.MathUtils.clamp(
        pointerPosition.pointX,
        0,
        width - 1,
      );
      const pointY = THREE.MathUtils.clamp(
        pointerPosition.pointY,
        0,
        height - 1,
      );
      const viewOffsetY = height - pointY - 1;

      const dictMat = prevRender(pickingTargets, pickingMaterial);

      const pickingRT = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        depthBuffer: true,
        stencilBuffer: false,
      });

      pickingRT.texture.colorSpace = THREE.NoColorSpace;

      pickRender(
        0,
        0,
        1,
        1,
        1,
        1,
        scene,
        camera,
        PICKING_LAYER,
        gl,
        pickingRT,
        {
          fullWidth: width,
          fullHeight: height,
          offsetX: pointX,
          offsetY: viewOffsetY,
          width: 1,
          height: 1,
        },
      );

      postRender(dictMat);

      // RGBA 값이 0~255의 정수로 작성되므로, Uint8Array를 사용해야한다
      const pickingData = new Uint8Array(4);

      await gl.readRenderTargetPixelsAsync(pickingRT, 0, 0, 1, 1, pickingData);

      pickingRT.dispose();

      // 화면 내의 모든 요소를 얻고 싶을 경우
      /* await gl.readRenderTargetPixelsAsync(
        pickingRT,
        0,
        0,
        width,
        height,
        pickingData,
      ); */

      const set = new Set<number>();

      for (let i = 0; i < pickingData.length; i += 4) {
        const redIndex = i;
        const greenIndex = i + 1;
        const blueIndex = i + 2;

        const red = pickingData[redIndex];
        const green = pickingData[greenIndex];
        const blue = pickingData[blueIndex];

        const id = convertColor2Int(red, green, blue);
        set.add(id);
      }

      const pickingId = set.values().next().value;
      setPickingId(pickingId ?? 0);
    },
    [
      gl,
      size,
      camera,
      scene,
      pickingMaterial,
      pickingTargets,
      setPickingId,
      setRayCastId,
    ],
  );

  useEffect(() => {
    const canvas = gl.domElement;

    canvas.addEventListener("click", onClick);

    return () => {
      canvas.removeEventListener("click", onClick);
    };
  }, [gl, onClick]);
}

type TMaterialRestore = {
  mesh: THREE.Mesh;
  material: THREE.Material;
  layers: number;
};

export function InstancedMesh() {
  const { gl, scene, camera, size } = useThree();

  const refInit = useRef<boolean>(false);

  const [pickingTargets, setPickingTargets] = useState<THREE.Object3D[]>([]);

  useEffect(() => {
    if (refInit.current) return;
    refInit.current = true;

    const color = new THREE.Color("#ffffff");
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color });

    const instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.instanceCount = HEIGHT_CNT * WIDTH_CNT;

    for (const k in geometry.attributes) {
      const bufferAttribute = geometry.attributes[`${k}`];
      instancedGeometry.setAttribute(k, bufferAttribute);
    }

    if (geometry.index) {
      instancedGeometry.index = geometry.index.clone();
    }

    const ids = [];
    const pickings = [];

    for (let id = 1; id <= WIDTH_CNT * HEIGHT_CNT; id++) {
      ids.push(id);
      pickings.push(...convertInt2Color(id));
    }

    const idArray = new Int32Array(ids);
    const pickingArray = new Float32Array(pickings);

    instancedGeometry.setAttribute(
      "id",
      new THREE.InstancedBufferAttribute(idArray, 1, false),
    );

    instancedGeometry.setAttribute(
      "picking",
      new THREE.InstancedBufferAttribute(pickingArray, 3, false),
    );

    const instancedMesh = new THREE.InstancedMesh(
      instancedGeometry,
      material,
      WIDTH_CNT * HEIGHT_CNT,
    );

    const gapW = 1.5;
    const gapH = 1.5;

    const widthLength = gapW * WIDTH_CNT;
    const heightLength = gapH * HEIGHT_CNT;

    const startX = widthLength / -2;
    const startZ = heightLength / -2;

    const mat = new THREE.Matrix4();
    const vec = new THREE.Vector3();

    for (let row = 0; row < HEIGHT_CNT; row++) {
      for (let col = 0; col < WIDTH_CNT; col++) {
        const x = startX + col * gapW;
        const y = 0.5;
        const z = startZ + row * gapH;

        vec.set(x, y, z);
        mat.setPosition(vec);

        const index = row * WIDTH_CNT + col;
        instancedMesh.setMatrixAt(index, mat);
      }
    }

    instancedMesh.matrixWorldNeedsUpdate = true;

    scene.add(instancedMesh);

    setPickingTargets([instancedMesh]);

    return () => {
      scene.remove(instancedMesh);
      instancedMesh.dispose();
      geometry.dispose();
      material.dispose();

      setPickingTargets((prev) =>
        prev.filter((prev) => prev.id != instancedMesh.id),
      );
    };
  }, [scene, setPickingTargets]);

  const pickingMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: vertexShader300,
      fragmentShader: fragmentShader300,
      depthTest: true,
      depthWrite: true,
      blending: THREE.NoBlending,
      toneMapped: false, // tone mapped를 false로 설정하였으므로, 색상 변화의 영향을 받지 않음
      glslVersion: THREE.GLSL3,
    });
  }, []);

  // const dictMat = useMemo(() => {
  //   return new Map<string, TMaterialRestore>();
  // }, []);

  const SCISSOR_GAP = 0;

  useFrame(() => {
    gl.clear();

    gl.setScissorTest(true);

    gl.setScissor(0, 0, size.width / 2 - SCISSOR_GAP, size.height);
    gl.render(scene, camera);

    const dictMat = prevRender(pickingTargets, pickingMaterial);
    /* 
    gl.setScissor(
      size.width / 2 + SCISSOR_GAP,
      0,
      size.width / 2 - SCISSOR_GAP,
      size.height,
    );
 */
    // const cameraLayer = camera.layers.mask;

    // camera.layers.set(PICKING_LAYER);
    // gl.render(scene, camera);

    // console.log(size.width);
    pickRender(
      size.width / 2 + SCISSOR_GAP,
      0,
      size.width / 2 - SCISSOR_GAP,
      size.height,
      size.width,
      size.height,
      scene,
      camera,
      PICKING_LAYER,
      gl,
      null,
    );

    // camera.layers.mask = cameraLayer;

    postRender(dictMat);

    gl.setScissorTest(false);
  }, 1);

  useCanvasInteraction(
    gl,
    size,
    scene,
    camera,
    pickingTargets,
    pickingMaterial,
  );

  return null;
}
