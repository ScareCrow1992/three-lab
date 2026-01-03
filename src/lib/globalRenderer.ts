import * as THREE from "three";
import { CanvasTarget, WebGPURenderer } from "three/webgpu";

type Updatable = { update: (time?: number) => void };

let initialized = false;
const renderer: WebGPURenderer = new WebGPURenderer({
  antialias: true,
  multiview: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.init().then(() => {
  initialized = true;

  initWaitings.forEach((initWaiting) => {
    GlobalRender(initWaiting);
  });
  initWaitings.length = 0;
});

export type MultipleRender = {
  canvasTarget: CanvasTarget;
  scene: THREE.Scene;
  camera: THREE.Camera;
  width: number;
  height: number;
  updatables?: Updatable[];
};

const store: Record<number, MultipleRender> = {};
let storeArr: MultipleRender[] = [];
const keyPool: number[] = [];
let storeKey = 1;

const initWaitings: MultipleRender[] = [];

export function AddAnimation({
  canvasTarget,
  scene,
  camera,
  width,
  height,
  updatables,
}: MultipleRender): number {
  if (Object.keys(store).length === 0) {
    renderer.setAnimationLoop(AnimationLoop);
  }

  let cKey: number = null!;
  if (keyPool.length > 0) {
    cKey = keyPool[keyPool.length - 1];
    keyPool.length--;
  } else {
    cKey = storeKey;
    storeKey++;
  }

  store[cKey] = { canvasTarget, scene, camera, width, height, updatables };

  storeArr = Object.values(store);

  return cKey;
}

export function RemoveAnimation(key: number) {
  delete store[key];
  keyPool.push(key);

  if (Object.keys(store).length === 0) {
    renderer.setAnimationLoop(null);
  }

  storeArr = Object.values(store);
}

function AnimationLoop() {
  if (!renderer.initialized) return;

  storeArr.forEach((renderData) => {
    GlobalRender(renderData);
    renderData.updatables?.forEach((updatable) => updatable.update());
  });
}

export function InitRender(renderData: MultipleRender) {
  if (initialized) {
    GlobalRender(renderData);
  } else {
    initWaitings.push(renderData);
  }
}

function GlobalRender(
  // canvas: HTMLCanvasElement,
  renderData: MultipleRender
) {
  const canvasTarget: CanvasTarget = renderData.canvasTarget;
  const scene: THREE.Scene = renderData.scene;
  const camera: THREE.Camera = renderData.camera;
  const width: number = renderData.width;
  const height: number = renderData.height;

  if (!initialized) return;

  // 반드시 setCanvasTarget 호출 후, setSize를 호출해야한다.
  // 안그러면 기존에 그린 화면이 모두 지워진다.
  renderer.setCanvasTarget(canvasTarget);
  renderer.setSize(width, height);

  renderer.render(scene, camera);
}
