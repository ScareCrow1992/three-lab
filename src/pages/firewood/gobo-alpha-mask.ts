import type { Material } from "three";

const ALPHA_TEST_FRAGMENT_CHUNK = "#include <alphatest_fragment>";

const GOBO_LUMINANCE_ALPHA_MASK = `
float goboLuminance = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
diffuseColor.a = 1.0 - goboLuminance;
${ALPHA_TEST_FRAGMENT_CHUNK}
`;

export const applyGoboLuminanceAlphaMask: Material["onBeforeCompile"] = (
  shader,
) => {
  shader.fragmentShader = shader.fragmentShader.replace(
    ALPHA_TEST_FRAGMENT_CHUNK,
    GOBO_LUMINANCE_ALPHA_MASK,
  );
};
