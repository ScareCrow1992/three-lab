import * as THREE from "three";
import { textureLoader } from "@/loader/loader";
import { useEffect, useState } from "react";

export function useTexture(url: string) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setFailed(false);
    setTexture(null);

    textureLoader
      .loadAsync(url)
      .then((ret) => {
        if (cancelled) return;
        setTexture(ret);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setFailed(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { loading, failed, texture };
}
