import { Effect, BlendFunction } from "postprocessing";
import { Uniform } from "three";
import { wrapEffect } from "@react-three/postprocessing";

export type CenterCircleEffectOptions = {
  radius?: number; // 0 ~ 0.5 (uv 기준)
  feather?: number; // 가장자리 부드러움
  opacity?: number; // 0 ~ 1
  blendFunction?: BlendFunction;
};

const fragment = `
uniform float uRadius;   // circle radius in UV space
uniform float uFeather;  // edge softness
uniform float uOpacity;  // circle opacity

float circleMask(vec2 uv, float radius, float feather) {
  vec2 p = uv - vec2(0.5);
  float d = length(p);
  return 1.0 - smoothstep(radius, radius + feather, d);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float m = circleMask(uv, uRadius, uFeather);
  vec3 circle = vec3(1.0); // white
  vec3 color = mix(inputColor.rgb, circle, m * uOpacity);
  outputColor = vec4(color, inputColor.a);
}
`;

export class CenterCircleEffect extends Effect {
  declare uniforms: Map<string, Uniform>;

  constructor({
    radius = 0.08,
    feather = 0.005,
    opacity = 1.0,
    blendFunction = BlendFunction.NORMAL,
  }: CenterCircleEffectOptions = {}) {
    super("CenterCircleEffect", fragment, {
      blendFunction,
      uniforms: new Map<string, Uniform>([
        ["uRadius", new Uniform(radius)],
        ["uFeather", new Uniform(feather)],
        ["uOpacity", new Uniform(opacity)],
      ]),
    });
  }

  get radius(): number {
    return this.uniforms.get("uRadius")!.value as number;
  }
  set radius(v: number) {
    this.uniforms.get("uRadius")!.value = v;
  }

  get feather(): number {
    return this.uniforms.get("uFeather")!.value as number;
  }
  set feather(v: number) {
    this.uniforms.get("uFeather")!.value = v;
  }

  get opacity(): number {
    return this.uniforms.get("uOpacity")!.value as number;
  }
  set opacity(v: number) {
    this.uniforms.get("uOpacity")!.value = v;
  }
}
export const CenterCircle = wrapEffect(CenterCircleEffect, {
  radius: 0.08,
  feather: 0.006,
  opacity: 1.0,
});
