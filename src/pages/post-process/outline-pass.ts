// src/pages/post-process/outline-pass.ts
import {
  BlendFunction,
  ClearPass,
  DepthComparisonMaterial,
  DepthPass,
  Effect,
  KawaseBlurPass,
  KernelSize,
  OutlineMaterial,
  RenderPass,
  Resolution,
  Selection,
  ShaderPass,
} from "postprocessing";
import {
  Camera,
  Color,
  RepeatWrapping,
  Scene,
  Texture,
  Uniform,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import fragmentShader from "./shaders/outline.frag";
import vertexShader from "./shaders/outline.vert";

type OutlineEffectOptions = {
  blendFunction?: BlendFunction;
  patternTexture?: Texture | null;
  patternScale?: number;
  edgeStrength?: number;
  pulseSpeed?: number;
  visibleEdgeColor?: number;
  hiddenEdgeColor?: number;
  kernelSize?: KernelSize;
  blur?: boolean;
  xRay?: boolean;
  multisampling?: number;
  resolutionScale?: number;
  resolutionX?: number;
  resolutionY?: number;
  width?: number;
  height?: number;
};

/**
 * An outline effect.
 */
export class OutlineEffect extends Effect {
  private scene: Scene;
  private camera: Camera;
  private renderTargetMask: WebGLRenderTarget;
  private renderTargetOutline: WebGLRenderTarget;
  private clearPass: ClearPass;
  private depthPass: DepthPass;
  private maskPass: RenderPass;
  private maskMaterial: DepthComparisonMaterial;
  public blurPass: KawaseBlurPass;
  private outlinePass: ShaderPass;
  private time: number;
  private forceUpdate: boolean;
  public selection: Selection;
  public pulseSpeed: number;

  private getUniform<T>(name: string): Uniform<T> {
    const uniform = this.uniforms.get(name);
    if (!uniform) {
      throw new Error(`Uniform ${name} is missing`);
    }
    return uniform as Uniform<T>;
  }

  /**
   * Constructs a new outline effect.
   *
   * @param scene - The main scene.
   * @param camera - The main camera.
   * @param options - Options for the outline effect.
   */
  constructor(
    scene: Scene,
    camera: Camera,
    {
      blendFunction = BlendFunction.SCREEN,
      patternTexture = null,
      patternScale = 1.0,
      edgeStrength = 1.0,
      pulseSpeed = 0.0,
      visibleEdgeColor = 0xffffff,
      hiddenEdgeColor = 0x22090a,
      kernelSize = KernelSize.VERY_SMALL,
      blur = false,
      xRay = true,
      multisampling = 0,
      resolutionScale = 0.5,
      width = Resolution.AUTO_SIZE,
      height = Resolution.AUTO_SIZE,
      resolutionX = width,
      resolutionY = height,
    }: OutlineEffectOptions = {}
  ) {
    super("OutlineEffect", fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ["maskTexture", new Uniform<Texture | null>(null)],
        ["edgeTexture", new Uniform<Texture | null>(null)],
        ["edgeStrength", new Uniform(edgeStrength)],
        ["visibleEdgeColor", new Uniform(new Color(visibleEdgeColor))],
        ["hiddenEdgeColor", new Uniform(new Color(hiddenEdgeColor))],
        ["pulse", new Uniform(1.0)],
        ["patternScale", new Uniform(patternScale)],
        ["patternTexture", new Uniform<Texture | null>(null)],
      ]),
    });

    this.blendMode.addEventListener("change", () => {
      if (this.blendMode.blendFunction === BlendFunction.ALPHA) {
        this.defines.set("ALPHA", "1");
      } else {
        this.defines.delete("ALPHA");
      }

      this.setChanged();
    });

    this.blendMode.blendFunction = blendFunction;
    this.patternTexture = patternTexture;
    this.xRay = xRay;

    this.scene = scene;
    this.camera = camera;

    this.renderTargetMask = new WebGLRenderTarget(1, 1);
    this.renderTargetMask.samples = multisampling;
    this.renderTargetMask.texture.name = "Outline.Mask";
    this.getUniform<Texture | null>("maskTexture").value =
      this.renderTargetMask.texture;

    this.renderTargetOutline = new WebGLRenderTarget(1, 1, {
      depthBuffer: false,
    });
    this.renderTargetOutline.texture.name = "Outline.Edges";
    this.getUniform<Texture | null>("edgeTexture").value =
      this.renderTargetOutline.texture;

    this.clearPass = new ClearPass();
    this.clearPass.overrideClearColor = new Color(0x000000);
    this.clearPass.overrideClearAlpha = 1;

    this.depthPass = new DepthPass(scene, camera);

    this.maskMaterial = new DepthComparisonMaterial(
      this.depthPass.texture,
      camera
    );
    this.maskPass = new RenderPass(scene, camera, this.maskMaterial);
    const clearPass = this.maskPass.clearPass;
    clearPass.overrideClearColor = new Color(0xffffff);
    clearPass.overrideClearAlpha = 1;

    this.blurPass = new KawaseBlurPass({
      resolutionScale,
      resolutionX,
      resolutionY,
      kernelSize,
    });
    this.blurPass.enabled = blur;
    const resolution = this.blurPass.resolution;
    resolution.addEventListener("change", () =>
      this.setSize(resolution.baseWidth, resolution.baseHeight)
    );

    this.outlinePass = new ShaderPass(new OutlineMaterial());
    const outlineMaterial = this.outlinePass
      .fullscreenMaterial as OutlineMaterial;
    outlineMaterial.inputBuffer = this.renderTargetMask.texture;

    this.time = 0;
    this.forceUpdate = true;

    this.selection = new Selection();

    this.pulseSpeed = pulseSpeed;
  }

  set mainScene(value: Scene) {
    this.scene = value;
    this.depthPass.mainScene = value;
    this.maskPass.mainScene = value;
  }

  set mainCamera(value: Camera) {
    this.camera = value;
    this.depthPass.mainCamera = value;
    this.maskPass.mainCamera = value;
    this.maskMaterial.copyCameraSettings(value);
  }

  /**
   * The resolution of this effect.
   */
  get resolution(): Resolution {
    return this.blurPass.resolution;
  }

  /**
   * Returns the resolution.
   */
  getResolution() {
    return this.blurPass.getResolution();
  }

  /**
   * The amount of MSAA samples.
   */
  get multisampling(): number {
    return this.renderTargetMask.samples;
  }

  set multisampling(value: number) {
    this.renderTargetMask.samples = value;
    this.renderTargetMask.dispose();
  }

  /**
   * The pattern scale.
   */
  get patternScale(): number {
    return this.getUniform<number>("patternScale").value;
  }

  set patternScale(value: number) {
    this.getUniform<number>("patternScale").value = value;
  }

  /**
   * The edge strength.
   */
  get edgeStrength(): number {
    return this.getUniform<number>("edgeStrength").value;
  }

  set edgeStrength(value: number) {
    this.getUniform<number>("edgeStrength").value = value;
  }

  /**
   * The visible edge color.
   */
  get visibleEdgeColor(): Color {
    return this.getUniform<Color>("visibleEdgeColor").value;
  }

  set visibleEdgeColor(value: Color) {
    this.getUniform<Color>("visibleEdgeColor").value = value;
  }

  /**
   * The hidden edge color.
   */
  get hiddenEdgeColor(): Color {
    return this.getUniform<Color>("hiddenEdgeColor").value;
  }

  set hiddenEdgeColor(value: Color) {
    this.getUniform<Color>("hiddenEdgeColor").value = value;
  }

  /**
   * Returns the blur pass.
   *
   * @deprecated Use blurPass instead.
   */
  getBlurPass() {
    return this.blurPass;
  }

  /**
   * Returns the selection.
   *
   * @deprecated Use selection instead.
   */
  getSelection() {
    return this.selection;
  }

  /**
   * Returns the pulse speed.
   *
   * @deprecated Use pulseSpeed instead.
   */
  getPulseSpeed() {
    return this.pulseSpeed;
  }

  /**
   * Sets the pulse speed. Set to zero to disable.
   *
   * @deprecated Use pulseSpeed instead.
   */
  setPulseSpeed(value: number) {
    this.pulseSpeed = value;
  }

  /**
   * The current width of the internal render targets.
   *
   * @deprecated Use resolution.width instead.
   */
  get width(): number {
    return this.resolution.width;
  }

  set width(value: number) {
    this.resolution.preferredWidth = value;
  }

  /**
   * The current height of the internal render targets.
   *
   * @deprecated Use resolution.height instead.
   */
  get height(): number {
    return this.resolution.height;
  }

  set height(value: number) {
    this.resolution.preferredHeight = value;
  }

  /**
   * The selection layer.
   *
   * @deprecated Use selection.layer instead.
   */
  get selectionLayer(): number {
    return this.selection.layer;
  }

  set selectionLayer(value: number) {
    this.selection.layer = value;
  }

  /**
   * Indicates whether dithering is enabled.
   *
   * @deprecated
   */
  get dithering(): boolean {
    return this.blurPass.dithering;
  }

  set dithering(value: boolean) {
    this.blurPass.dithering = value;
  }

  /**
   * The blur kernel size.
   *
   * @deprecated Use blurPass.kernelSize instead.
   */
  get kernelSize(): KernelSize {
    return this.blurPass.kernelSize;
  }

  set kernelSize(value: KernelSize) {
    this.blurPass.kernelSize = value;
  }

  /**
   * Indicates whether the outlines should be blurred.
   *
   * @deprecated Use blurPass.enabled instead.
   */
  get blur(): boolean {
    return this.blurPass.enabled;
  }

  set blur(value: boolean) {
    this.blurPass.enabled = value;
  }

  /**
   * Indicates whether X-ray mode is enabled.
   */
  get xRay(): boolean {
    return this.defines.has("X_RAY");
  }

  set xRay(value: boolean) {
    if (this.xRay !== value) {
      if (value) {
        this.defines.set("X_RAY", "1");
      } else {
        this.defines.delete("X_RAY");
      }

      this.setChanged();
    }
  }

  /**
   * Indicates whether X-ray mode is enabled.
   *
   * @deprecated Use xRay instead.
   */
  isXRayEnabled() {
    return this.xRay;
  }

  /**
   * Enables or disables X-ray outlines.
   *
   * @deprecated Use xRay instead.
   */
  setXRayEnabled(value: boolean) {
    this.xRay = value;
  }

  /**
   * The pattern texture. Set to `null` to disable.
   */
  get patternTexture(): Texture | null {
    return this.getUniform<Texture | null>("patternTexture").value;
  }

  set patternTexture(value: Texture | null) {
    if (value !== null) {
      value.wrapS = value.wrapT = RepeatWrapping;
      this.defines.set("USE_PATTERN", "1");
      this.setVertexShader(vertexShader as unknown as string);
    } else {
      this.defines.delete("USE_PATTERN");
      this.setVertexShader(null as unknown as string);
    }

    this.getUniform<Texture | null>("patternTexture").value = value;
    this.setChanged();
  }

  /**
   * Sets the pattern texture.
   *
   * @deprecated Use patternTexture instead.
   */
  setPatternTexture(value: Texture) {
    this.patternTexture = value;
  }

  /**
   * Returns the current resolution scale.
   *
   * @deprecated Use resolution instead.
   */
  getResolutionScale() {
    return this.resolution.scale;
  }

  /**
   * Sets the resolution scale.
   *
   * @deprecated Use resolution instead.
   */
  setResolutionScale(scale: number) {
    this.resolution.scale = scale;
  }

  /**
   * Clears the current selection and selects a list of objects.
   *
   * @deprecated Use selection.set() instead.
   */
  setSelection(objects: Scene["children"]) {
    this.selection.set(objects);
    return this;
  }

  /**
   * Clears the list of selected objects.
   *
   * @deprecated Use selection.clear() instead.
   */
  clearSelection() {
    this.selection.clear();
    return this;
  }

  /**
   * Selects an object.
   *
   * @deprecated Use selection.add() instead.
   */
  selectObject(object: Scene["children"][number]) {
    this.selection.add(object);
    return this;
  }

  /**
   * Deselects an object.
   *
   * @deprecated Use selection.delete() instead.
   */
  deselectObject(object: Scene["children"][number]) {
    this.selection.delete(object);
    return this;
  }

  /**
   * Updates this effect.
   *
   * @param renderer - The renderer.
   * @param _inputBuffer - The previous pass buffer.
   * @param deltaTime - Time delta in seconds.
   */
  update(
    renderer: WebGLRenderer,
    _inputBuffer: WebGLRenderTarget | null,
    deltaTime = 0
  ) {
    const scene = this.scene;
    const camera = this.camera;
    const selection = this.selection;
    const pulse = this.getUniform<number>("pulse");

    const background = scene.background;
    const mask = camera.layers.mask;

    if (this.forceUpdate || selection.size > 0) {
      scene.background = null;
      pulse.value = 1;

      if (this.pulseSpeed > 0) {
        pulse.value =
          Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375 + 0.625;
      }

      this.time += deltaTime;

      selection.setVisible(false);
      this.depthPass.render(renderer);
      selection.setVisible(true);

      camera.layers.set(selection.layer);
      this.maskPass.render(renderer, this.renderTargetMask);

      camera.layers.mask = mask;
      scene.background = background;

      this.outlinePass.render(renderer, null, this.renderTargetOutline);

      if (this.blurPass.enabled) {
        this.blurPass.render(
          renderer,
          this.renderTargetOutline,
          this.renderTargetOutline
        );
      }
    }

    this.forceUpdate = selection.size > 0;
  }

  /**
   * Updates the size of internal render targets.
   */
  setSize(width: number, height: number) {
    this.blurPass.setSize(width, height);
    this.renderTargetMask.setSize(width, height);

    const resolution = this.resolution;
    resolution.setBaseSize(width, height);
    const w = resolution.width;
    const h = resolution.height;

    this.depthPass.setSize(w, h);
    this.renderTargetOutline.setSize(w, h);
    (this.outlinePass.fullscreenMaterial as OutlineMaterial).setSize(w, h);
  }

  /**
   * Performs initialization tasks.
   */
  initialize(
    renderer: WebGLRenderer,
    alpha: boolean,
    frameBufferType?: number
  ) {
    this.blurPass.initialize(renderer, alpha, UnsignedByteType);

    if (frameBufferType !== undefined) {
      this.depthPass.initialize(renderer, alpha, frameBufferType);
      this.maskPass.initialize(renderer, alpha, frameBufferType);
      this.outlinePass.initialize(renderer, alpha, frameBufferType);
    }
  }
}
