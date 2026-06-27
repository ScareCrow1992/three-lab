import type { Object3D, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

export type FirewoodPostprocessingOptions = {
  focus?: number;
  desktopAperture?: number;
  mobileAperture?: number;
  maxBlur?: number;
  isMobile?: boolean;
  excludeFromBokeh?: Object3D[];
};

export type FirewoodPostprocessing = {
  composer: EffectComposer;
  renderPass: RenderPass;
  bokehPass: BokehPass;
  outputPass: OutputPass;
  render: (deltaSeconds?: number) => void;
  setSize: (width: number, height: number) => void;
  dispose: () => void;
};

const DEFAULT_FOCUS = 1.4;
const DEFAULT_DESKTOP_APERTURE = 0.003;
const DEFAULT_MOBILE_APERTURE = 0.006;
const DEFAULT_MAX_BLUR = 1;

export function createFirewoodPostprocessing(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  options: FirewoodPostprocessingOptions = {},
): FirewoodPostprocessing {
  const resolved = resolvePostprocessingOptions(options);
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const bokehPass = new BokehPass(scene, camera, {
    focus: resolved.focus,
    aperture: resolved.isMobile
      ? resolved.mobileAperture
      : resolved.desktopAperture,
    maxblur: resolved.maxBlur,
  });
  const outputPass = new OutputPass();

  wrapBokehRenderWithVisibilityMask(bokehPass, resolved.excludeFromBokeh);

  composer.addPass(renderPass);
  composer.addPass(bokehPass);
  composer.addPass(outputPass);

  return {
    composer,
    renderPass,
    bokehPass,
    outputPass,
    render(deltaSeconds) {
      composer.render(deltaSeconds);
    },
    setSize(width, height) {
      composer.setSize(width, height);
    },
    dispose() {
      composer.dispose();
      renderPass.dispose();
      bokehPass.dispose();
      outputPass.dispose();
    },
  };
}

function resolvePostprocessingOptions(
  options: FirewoodPostprocessingOptions,
): Required<FirewoodPostprocessingOptions> {
  return {
    focus: options.focus ?? DEFAULT_FOCUS,
    desktopAperture: options.desktopAperture ?? DEFAULT_DESKTOP_APERTURE,
    mobileAperture: options.mobileAperture ?? DEFAULT_MOBILE_APERTURE,
    maxBlur: options.maxBlur ?? DEFAULT_MAX_BLUR,
    isMobile:
      options.isMobile ?? /Mobi|Android|iPhone/i.test(navigator.userAgent),
    excludeFromBokeh: options.excludeFromBokeh ?? [],
  };
}

function wrapBokehRenderWithVisibilityMask(
  bokehPass: BokehPass,
  excludedObjects: Object3D[],
): void {
  if (excludedObjects.length === 0) {
    return;
  }

  const originalRender = bokehPass.render.bind(bokehPass);

  bokehPass.render = (...args: Parameters<BokehPass["render"]>) => {
    const previousVisibility = excludedObjects.map((object) => object.visible);

    for (const object of excludedObjects) {
      object.visible = false;
    }

    try {
      originalRender(...args);
    } finally {
      for (let index = 0; index < excludedObjects.length; index += 1) {
        excludedObjects[index].visible = previousVisibility[index];
      }
    }
  };
}
