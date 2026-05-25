import { Box, Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function LineSegmentIntersectionTab() {
  return (
    <div className="relative block w-full h-full">
      <Canvas className="relative block w-full h-full" shadows>
        <PerspectiveCamera position={[10, 10, 10]} />
        <OrbitControls enablePan={false} />
        <Grid
          infiniteGrid={false}
          cellSize={1}
          sectionSize={0.1}
          sectionColor={"#dddddd"}
          args={[10, 10]}
        />
      </Canvas>
    </div>
  );
}
