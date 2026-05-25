import * as THREE from "three";

export function pickRender(
  pixelX: number,
  pixelY: number,
  scissorX: number,
  scissorY: number,
  drawningWidth: number,
  drawningHeight: number,
  scene: THREE.Scene,
  camera: THREE.Camera,
  pickingLayer: number,
  gl: THREE.WebGLRenderer,
  rtv: THREE.WebGLRenderTarget | null,
) {
  // backup
  const prevRTV = gl.getRenderTarget();
  const prevCameraLayer = camera.layers.mask;
  const prevAlpha = gl.getClearAlpha();
  const prevColor = gl.getClearColor(new THREE.Color());
  const prevToneMapping = gl.toneMapping;
  const prevOutputColorSpace = gl.outputColorSpace;
  const prevViewPort = gl.getViewport(new THREE.Vector4());
  const prevScissor = gl.getScissor(new THREE.Vector4());
  const prevScissorTest = gl.getScissorTest();

  // initialize
  if (rtv) {
    gl.setRenderTarget(rtv);
  }
  camera.layers.set(pickingLayer);
  gl.setClearAlpha(0);
  gl.setClearColor(new THREE.Color("black"));
  gl.toneMapping = THREE.NoToneMapping;
  gl.outputColorSpace = THREE.LinearSRGBColorSpace;

  // setViewport와 setScissor의 width, height 는 pixelRatio가 적용안된 수치여야한다.
  gl.setViewport(0, 0, drawningWidth, drawningHeight);
  gl.setScissor(pixelX, pixelY, scissorX, scissorY);
  gl.setScissorTest(true);

  /** render begin */
  gl.render(scene, camera);
  /** render end */

  // roll-back
  if (rtv) {
    gl.setRenderTarget(prevRTV);
  }
  camera.layers.mask = prevCameraLayer;
  gl.setClearAlpha(prevAlpha);
  gl.setClearColor(prevColor);
  gl.toneMapping = prevToneMapping;
  gl.outputColorSpace = prevOutputColorSpace;
  gl.setViewport(prevViewPort);
  gl.setScissor(prevScissor);
  gl.setScissorTest(prevScissorTest);
}
