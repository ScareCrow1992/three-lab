import * as THREE from "three";

type ViewOffset = {
  enabled?: boolean;
  fullWidth: number;
  fullHeight: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

// gl.setViewPort로 렌더링 영역을 제한하고
// 카메라는 그대로 둘 경우,
// 카메라가 바라보는 영역 전체를 변환된 영역에 투영하려 한다.
// 이때 1X1 과 같은 매우 작은 영역에 대해서는,
// 정확히 1pixel에 해당하는 지점의 렌더링 결과가 아닌
// 전체 렌더링 결과를 viewport에 투영하게 되므로
// 원하는 결과를 얻을 수 없게 된다.
// 그러므로 카메라의 viewOffset도 수정해야한다
type ViewOffsetCamera = THREE.Camera & {
  view?: ViewOffset | null;
  setViewOffset?: (
    fullWidth: number,
    fullHeight: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
  ) => void;
  clearViewOffset?: () => void;
};

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
  viewOffset?: ViewOffset,
) {
  // backup
  const prevRTV = gl.getRenderTarget();
  const prevCameraLayer = camera.layers.mask;
  const viewOffsetCamera = camera as ViewOffsetCamera;
  const prevCameraView = viewOffsetCamera.view?.enabled
    ? { ...viewOffsetCamera.view }
    : null;
  const prevAlpha = gl.getClearAlpha();
  const prevColor = gl.getClearColor(new THREE.Color());
  const prevToneMapping = gl.toneMapping;
  const prevOutputColorSpace = gl.outputColorSpace;
  const prevViewPort = gl.getViewport(new THREE.Vector4());
  const prevScissor = gl.getScissor(new THREE.Vector4());
  const prevScissorTest = gl.getScissorTest();

  // initialize
  if (rtv) {
    // rtv가 null일 경우, 대상은 canvas가 되며
    // 이때 width와 height는 자동으로 dpr을 곱한 값이 들어간다.
    // 하지만 rtv가 null이 아닐 경우,
    // 개발자는 width와 height에 dpr을 직접 적용해야한다.
    // 이는 함수호출 순서상 영향을 받을 수 있으므로
    // render target 설정 함수는 제일 앞에 두어야 한다.

    // 하지만 이 패턴은, gl 과 rt의 상태가 매우 애매해진다는 단점이 있다.
    // 테스트베드 환경에서는 우선 이정도 구현만 진행하고
    // 추후 gl이 아닌 rt의 viewport와 scissor를 직접 수정하고
    // gl과 render target의 상태에 대한 심도있는 학습은 별도로 진행하자
    gl.setRenderTarget(rtv);
  }
  camera.layers.set(pickingLayer);
  if (viewOffset) {
    viewOffsetCamera.setViewOffset?.(
      viewOffset.fullWidth,
      viewOffset.fullHeight,
      viewOffset.offsetX,
      viewOffset.offsetY,
      viewOffset.width,
      viewOffset.height,
    );
  }
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
  if (viewOffset) {
    if (prevCameraView) {
      viewOffsetCamera.setViewOffset?.(
        prevCameraView.fullWidth,
        prevCameraView.fullHeight,
        prevCameraView.offsetX,
        prevCameraView.offsetY,
        prevCameraView.width,
        prevCameraView.height,
      );
    } else {
      viewOffsetCamera.clearViewOffset?.();
    }
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
