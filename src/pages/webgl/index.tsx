import { useEffect, useRef } from "react";
import { main } from "./model/render";

export default function WebGLTab() {
  const refCanvas = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const canvas = refCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext("webgl");

    if (!ctx) return;

    main(ctx);
  }, []);

  return (
    <div className="w-full h-full">
      <canvas className="w-full h-full" ref={refCanvas} />
    </div>
  );
}
