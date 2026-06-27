import {
  BufferGeometry,
  BufferAttribute,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";

const INCH_TO_METERS = 0.0254;

// 번들 코드의 rw(e, t)
function layeredNoise(angle: number, seed = 0): number {
  return (
    Math.sin(angle * 127.1 + seed * 311.7) * 0.5 +
    Math.sin(angle * 269.5 + seed * 183.3) * 0.3 +
    Math.sin(angle * 419.2 + seed * 77.9) * 0.2
  );
}

function estimateGeometryVolumeInches(geometry: BufferGeometry): number {
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  if (!box) return 0;

  const size = new Vector3();
  box.getSize(size);

  return (size.x * size.y * size.z * 0.7) / INCH_TO_METERS ** 3;
}

type WoodMaterials = {
  side: MeshStandardMaterial;
  top: MeshStandardMaterial;
  inner: MeshStandardMaterial;
};

type ProceduralLogResult = {
  mesh: Mesh<BufferGeometry, MeshStandardMaterial[]>;
  volume: number;
};

export function createProceduralWoodLog(
  sideMaterial: MeshStandardMaterial,
  topMaterial: MeshStandardMaterial,
  innerMaterial: MeshStandardMaterial,
): ProceduralLogResult {
  const barkNoiseSeed = Math.random() * 1000;

  // 원본: (9 + Math.random() * 7) / 2
  // inch 단위 반지름. 대략 4.5~8 inch.
  const radiusInches = (9 + Math.random() * 7) / 2;

  // 원본: 12 + Math.random() * 4
  // inch 단위 길이. 대략 12~16 inch.
  const heightInches = 12 + Math.random() * 4;

  const radius = radiusInches * INCH_TO_METERS;
  const height = heightInches * INCH_TO_METERS;

  const radialSegments = 32;
  const heightSegments = 8;
  const openEnded = false;

  const geometry = new CylinderGeometry(
    radius,
    radius,
    height,
    radialSegments,
    heightSegments,
    openEnded,
  );

  const position = geometry.attributes.position as BufferAttribute;
  const uv = geometry.attributes.uv as BufferAttribute;
  const vertex = new Vector3();

  // CylinderGeometry에서 side vertex 개수:
  // (heightSegments + 1) * (radialSegments + 1)
  // = 9 * 33 = 297
  const sideVertexCount = 297;

  for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex++) {
    vertex.fromBufferAttribute(position, vertexIndex);

    const angleAroundLog = Math.atan2(vertex.z, vertex.x);

    // cylinder local y: -height/2 ~ +height/2
    // normalizedHeight: 0 ~ 1
    const normalizedHeight = vertex.y / height + 0.5;

    // cap 쪽 vertex는 원형 단면 텍스처가 잘 맞도록 uv를 다시 매핑
    if (vertexIndex >= sideVertexCount) {
      const capU = (vertex.x / radius + 1) / 2;
      const capV = (vertex.z / radius + 1) / 2;
      uv.setXY(vertexIndex, capU, capV);
    }

    const bottomNoise = layeredNoise(angleAroundLog * 3, barkNoiseSeed);
    const topNoise = layeredNoise(angleAroundLog * 3, barkNoiseSeed + 42);

    // 원본의 qu, Ju는 bark 표면 변형 강도 계열 상수
    const BARK_RADIUS_VARIATION = 0.4; // qu로 추정되는 의미
    const HEIGHT_TAPER_VARIATION = 0.8; // Ju로 추정되는 의미

    const heightBlendedNoise =
      bottomNoise + (topNoise - bottomNoise) * normalizedHeight;

    const radialOffset =
      heightBlendedNoise *
      (BARK_RADIUS_VARIATION *
        (1 + (1 - normalizedHeight) * HEIGHT_TAPER_VARIATION) *
        INCH_TO_METERS);

    const currentRadius = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);

    if (currentRadius > 0.0001) {
      const scale = (currentRadius + radialOffset) / currentRadius;

      vertex.x *= scale;
      vertex.z *= scale;

      position.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);
    }
  }

  // side bark texture의 U 좌표를 랜덤하게 밀어서
  // 매번 같은 나무껍질 패턴이 반복되어 보이지 않게 함
  const barkTextureOffset = Math.random();

  for (let vertexIndex = 0; vertexIndex < sideVertexCount; vertexIndex++) {
    uv.setX(vertexIndex, uv.getX(vertexIndex) + barkTextureOffset);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const center = new Vector3();

  if (geometry.boundingBox) {
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
  }

  // 원본은 [e, t, t].
  // 초기 통나무는 side/top/top만 사용하고,
  // innerMaterial은 split 이후 내부 절단면용으로 userData에 보관.
  const mesh = new Mesh(geometry, [sideMaterial, topMaterial, topMaterial]);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // 원본의 volume 계산:
  // Math.PI * radiusInches * radiusInches * heightInches
  const cylinderVolumeInches =
    Math.PI * radiusInches * radiusInches * heightInches;

  mesh.userData.volumeInches = cylinderVolumeInches;
  mesh.userData.radius = radiusInches;
  mesh.userData.height = heightInches;

  mesh.userData.isLog = true;
  mesh.userData.isSplittable = true;
  mesh.userData.isFirewood = false;

  mesh.userData.sideMaterial = sideMaterial;
  mesh.userData.topMaterial = topMaterial;
  mesh.userData.innerMaterial = innerMaterial;

  return {
    mesh,
    volume: cylinderVolumeInches,
  };
}
