import { ktx2loader } from "@/loader/gltf-loader";
import { useGLTF } from "@react-three/drei";
import type { WebGLRenderer } from "three";

export function useGLTFExtended(url: string, gl: WebGLRenderer) {
  return useGLTF(url, false, false, (loader) => {
    ktx2loader.detectSupport(gl);
    loader.setKTX2Loader(ktx2loader);
  });
}
