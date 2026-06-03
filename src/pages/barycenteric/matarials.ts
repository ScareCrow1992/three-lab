import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import vertexBlending from "@/shaders/3.00/barycentric/blending/center-blending.geo.glsl";
import fragmentBlending from "@/shaders/3.00/barycentric/blending/center-blending.frag.glsl";

import vertexEdge from "@/shaders/3.00/barycentric/edge/center-edge.geo.glsl";
import fragmentEdge from "@/shaders/3.00/barycentric/edge/center-edge.frag.glsl";

import vertexPoint from "@/shaders/3.00/barycentric/point/center-point.geo.glsl";
import fragmentPoint from "@/shaders/3.00/barycentric/point/center-point.frag.glsl";

import type { BarycentricMaterial } from "./type";
import { useBarycentricStore } from "./barycenteric.store";

export function useBarycentricMaterial() {
  const type = useBarycentricStore((s) => s.type);
  const [materials, setMaterials] = useState<
    Map<BarycentricMaterial, THREE.ShaderMaterial>
  >(new Map());

  useEffect(() => {
    const blending = new THREE.ShaderMaterial({
      vertexShader: vertexBlending,
      fragmentShader: fragmentBlending,
      glslVersion: THREE.GLSL3,
    });

    const edge = new THREE.ShaderMaterial({
      vertexShader: vertexEdge,
      fragmentShader: fragmentEdge,
      glslVersion: THREE.GLSL3,
    });

    const point = new THREE.ShaderMaterial({
      vertexShader: vertexPoint,
      fragmentShader: fragmentPoint,
      glslVersion: THREE.GLSL3,
    });

    setMaterials(
      new Map([
        ["blending", blending],
        ["edge", edge],
        ["point", point],
      ]),
    );

    return () => {
      blending.dispose();
      edge.dispose();
      point.dispose();
      setMaterials(new Map());
    };
  }, [setMaterials]);

  return useMemo(() => {
    if (materials.has(type)) return materials.get(type)!;
    else return null;
  }, [type, materials]);
}
