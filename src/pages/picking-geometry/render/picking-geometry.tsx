import { useEffect, useRef } from "react";
import { Mesh, Object3D } from "three";

// material이 아닌, post processing 방식으로 접근해야 한다.

export function PickingGeometry() {
  const refObj3d = useRef<Object3D>(null!);

  useEffect(() => {
    const obj3d = refObj3d.current;
    if (!obj3d) return;

    if (obj3d.type !== "Mesh") {
      return;
    }

    const mesh = obj3d as Mesh;
    const geometry = mesh.geometry;
    const indexbuffer = geometry.index;
    const indexArray = indexbuffer?.array;
    if (!indexArray) return;

    let edgeId = 1;
    const edgeIdMap = new Map<string, number>();

    const getEdgeId = (v0: number, v1: number): number => {
      const vFrom = Math.min(v0, v1);
      const vTo = Math.max(v0, v1);

      const key = `${vFrom}:${vTo}`;
      if (edgeIdMap.has(key)) {
        return edgeIdMap.get(key)!;
      } else {
        const cId = edgeId;
        edgeIdMap.set(key, cId);
        edgeId++;
        return cId;
      }
    };

    for (let i = 0; i < indexArray.length; i += 3) {
      const i0 = indexArray[i];
      const i1 = indexArray[i + 1];
      const i2 = indexArray[i + 2];

      const _edge0 = getEdgeId(i0, i1);
      const _edge1 = getEdgeId(i1, i2);
      const _edge2 = getEdgeId(i2, i0);
    }

    // geometry.index

    console.log(geometry);
  }, []);

  return (
    <mesh ref={refObj3d} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry />
      <meshBasicMaterial wireframe />
    </mesh>
  );
}
