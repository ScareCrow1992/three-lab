import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  MeshStandardMaterial,
  type Scene,
} from "three";

export type WindGrassOptions = {
  bladeCount?: number;
  innerRadius?: number;
  outerRadius?: number;
  bladeWidth?: number;
  minBladeHeight?: number;
  maxBladeHeight?: number;
  groundY?: number;
  windStrength?: number;
  windSpeed?: number;
};

export type WindGrass = {
  mesh: Mesh<InstancedBufferGeometry, MeshStandardMaterial>;
  material: MeshStandardMaterial;
  update: (deltaSeconds: number) => void;
  dispose: () => void;
};

type GrassBladePlacement = {
  x: number;
  z: number;
  height: number;
  rotationY: number;
  phase: number;
  colorMix: number;
};

type CompiledShader = {
  uniforms: Record<string, unknown>;
  vertexShader: string;
  fragmentShader: string;
};

const DEFAULT_BLADE_COUNT = 10_000;
const INCH_TO_METERS = 0.0254;
const FOOT_TO_METERS = 0.3048;

const DEFAULT_INNER_RADIUS = 12 * INCH_TO_METERS + 0.01;
const DEFAULT_OUTER_RADIUS = 10 * FOOT_TO_METERS;
const DEFAULT_BLADE_WIDTH = 0.008;
const DEFAULT_MIN_BLADE_HEIGHT = 0.05;
const DEFAULT_MAX_BLADE_HEIGHT = 0.1;
const DEFAULT_GROUND_Y = -0.33;
const DEFAULT_WIND_STRENGTH = 0.02;
const DEFAULT_WIND_SPEED = 1.2;

export function createWindGrass(
  scene: Scene,
  options: WindGrassOptions = {},
): WindGrass {
  const resolved = resolveWindGrassOptions(options);
  const bladeGeometry = createGrassBladeGeometry(resolved.bladeWidth);
  const placements = createGrassBladePlacements(resolved);
  const material = createGrassMaterial(
    resolved.windStrength,
    resolved.windSpeed,
  );
  const geometry = createInstancedGrassGeometry(
    bladeGeometry,
    placements,
    resolved.groundY,
  );
  const mesh = new Mesh(geometry, material);

  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  scene.add(mesh);

  return {
    mesh,
    material,
    update(deltaSeconds) {
      material.userData.windUniforms.uTime.value += deltaSeconds;
    },
    dispose() {
      scene.remove(mesh);
      bladeGeometry.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}

function resolveWindGrassOptions(
  options: WindGrassOptions,
): Required<WindGrassOptions> {
  return {
    bladeCount: options.bladeCount ?? DEFAULT_BLADE_COUNT,
    innerRadius: options.innerRadius ?? DEFAULT_INNER_RADIUS,
    outerRadius: options.outerRadius ?? DEFAULT_OUTER_RADIUS,
    bladeWidth: options.bladeWidth ?? DEFAULT_BLADE_WIDTH,
    minBladeHeight: options.minBladeHeight ?? DEFAULT_MIN_BLADE_HEIGHT,
    maxBladeHeight: options.maxBladeHeight ?? DEFAULT_MAX_BLADE_HEIGHT,
    groundY: options.groundY ?? DEFAULT_GROUND_Y,
    windStrength: options.windStrength ?? DEFAULT_WIND_STRENGTH,
    windSpeed: options.windSpeed ?? DEFAULT_WIND_SPEED,
  };
}

function createGrassBladeGeometry(bladeWidth: number): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= 3; row += 1) {
    const heightRatio = row / 3;
    const halfWidth = (bladeWidth / 2) * (1 - heightRatio * 0.7);

    positions.push(-halfWidth, heightRatio, 0);
    positions.push(halfWidth, heightRatio, 0);

    normals.push(0, 0, 1);
    normals.push(0, 0, 1);

    uvs.push(0, heightRatio);
    uvs.push(1, heightRatio);
  }

  for (let row = 0; row < 3; row += 1) {
    const lowerLeft = row * 2;
    const lowerRight = row * 2 + 1;
    const upperLeft = (row + 1) * 2;
    const upperRight = (row + 1) * 2 + 1;

    indices.push(lowerLeft, lowerRight, upperLeft);
    indices.push(lowerRight, upperRight, upperLeft);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "normal",
    new BufferAttribute(new Float32Array(normals), 3),
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);

  return geometry;
}

function createGrassBladePlacements(
  options: Required<WindGrassOptions>,
): GrassBladePlacement[] {
  const placements: GrassBladePlacement[] = [];
  const radiusSpan = options.outerRadius - options.innerRadius;

  while (placements.length < options.bladeCount) {
    const angle = Math.random() * Math.PI * 2;
    const radiusRatio = Math.random();
    const radius = options.innerRadius + radiusRatio * radiusSpan;
    const centerFalloff = (1 - radiusRatio) ** 1.5;

    if (Math.random() > centerFalloff) {
      continue;
    }

    placements.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      height:
        options.minBladeHeight +
        Math.random() * (options.maxBladeHeight - options.minBladeHeight),
      rotationY: Math.random() * Math.PI,
      phase: Math.random() * Math.PI * 2,
      colorMix: Math.random(),
    });
  }

  return placements;
}

// geometry batching
function createInstancedGrassGeometry(
  bladeGeometry: BufferGeometry,
  placements: GrassBladePlacement[],
  groundY: number,
): InstancedBufferGeometry {
  const geometry = new InstancedBufferGeometry();

  geometry.index = bladeGeometry.index;
  geometry.setAttribute("position", bladeGeometry.getAttribute("position"));
  geometry.setAttribute("normal", bladeGeometry.getAttribute("normal"));
  geometry.setAttribute("uv", bladeGeometry.getAttribute("uv"));

  const offsets = new Float32Array(placements.length * 3);
  const heights = new Float32Array(placements.length);
  const rotations = new Float32Array(placements.length);
  const phases = new Float32Array(placements.length);
  const colorMixes = new Float32Array(placements.length);

  for (let index = 0; index < placements.length; index += 1) {
    const placement = placements[index];

    offsets[index * 3 + 0] = placement.x;
    offsets[index * 3 + 1] = groundY;
    offsets[index * 3 + 2] = placement.z;
    heights[index] = placement.height;
    rotations[index] = placement.rotationY;
    phases[index] = placement.phase;
    colorMixes[index] = placement.colorMix;
  }

  geometry.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute("aHeight", new InstancedBufferAttribute(heights, 1));
  geometry.setAttribute("aRotY", new InstancedBufferAttribute(rotations, 1));
  geometry.setAttribute("aPhase", new InstancedBufferAttribute(phases, 1));
  geometry.setAttribute(
    "aColorMix",
    new InstancedBufferAttribute(colorMixes, 1),
  );
  geometry.instanceCount = placements.length;

  return geometry;
}

function createGrassMaterial(
  windStrength: number,
  windSpeed: number,
): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(0.2, 0.35, 0.1),
    roughness: 0.85,
    metalness: 0,
    side: DoubleSide,
  });

  const windUniforms = {
    uTime: { value: 0 },
    uWindStrength: { value: windStrength },
    uWindSpeed: { value: windSpeed },
  };

  material.userData.windUniforms = windUniforms;
  material.onBeforeCompile = (shader: CompiledShader) => {
    Object.assign(shader.uniforms, windUniforms);

    shader.vertexShader = `
      attribute vec3 aOffset;
      attribute float aHeight;
      attribute float aRotY;
      attribute float aPhase;
      attribute float aColorMix;

      uniform float uTime;
      uniform float uWindStrength;
      uniform float uWindSpeed;

      varying float vGrassHeight;
      varying float vGrassColorMix;
    ${shader.vertexShader}`;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `
      float cosRN = cos(aRotY);
      float sinRN = sin(aRotY);
      vec3 objectNormal = vec3(
        normal.x * cosRN - normal.z * sinRN,
        normal.y,
        normal.x * sinRN + normal.z * cosRN
      );
      `,
    );

    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      vec3 transformed = position;
      transformed.y *= aHeight;

      float cosR = cos(aRotY);
      float sinR = sin(aRotY);
      transformed = vec3(
        transformed.x * cosR - transformed.z * sinR,
        transformed.y,
        transformed.x * sinR + transformed.z * cosR
      );

      float windInfluence = uv.y * uv.y;
      float windX = sin(uTime * uWindSpeed + aPhase + aOffset.x * 3.0) * uWindStrength * windInfluence;
      float windZ = cos(uTime * uWindSpeed * 0.7 + aPhase + aOffset.z * 2.5) * uWindStrength * 0.4 * windInfluence;
      transformed.x += windX;
      transformed.z += windZ;

      transformed += aOffset;

      vGrassHeight = uv.y;
      vGrassColorMix = aColorMix;
      `,
    );

    shader.fragmentShader = `
      varying float vGrassHeight;
      varying float vGrassColorMix;
    ${shader.fragmentShader}`;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>

      vec3 darkGreen = vec3(0.08, 0.15, 0.04);
      vec3 lightGreen = vec3(0.20, 0.40, 0.10);
      vec3 dryGreen = vec3(0.20, 0.30, 0.10);

      vec3 grassBase = mix(darkGreen, lightGreen, vGrassColorMix);
      grassBase = mix(grassBase, dryGreen, vGrassColorMix * 0.3);
      vec3 grassColor = mix(grassBase * 0.7, grassBase * 1.2, vGrassHeight);

      diffuseColor.rgb = grassColor;
      `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_fragment_end>",
      `
      #include <lights_fragment_end>

      #if NUM_DIR_LIGHTS > 0
        vec3 backLightDir = directionalLights[0].direction;
        float NdotL = dot(normal, backLightDir);
        float sss = pow(max(0.0, -NdotL), 1.5) * 0.6;
        sss *= vGrassHeight;

        #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
          float grassShadow = getShadow(
            directionalShadowMap[0],
            directionalLightShadows[0].shadowMapSize,
            directionalLightShadows[0].shadowIntensity,
            directionalLightShadows[0].shadowBias,
            directionalLightShadows[0].shadowRadius,
            vDirectionalShadowCoord[0]
          );
          sss *= grassShadow;
        #endif

        vec3 sssColor = vec3(0.5, 0.7, 0.15) * directionalLights[0].color * sss;
        reflectedLight.directDiffuse += sssColor * diffuseColor.rgb;
      #endif
      `,
    );
  };

  return material;
}
