"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "fabric";
import ToolBar from "./ToolBar";

interface FabricCanvasProps {
  width?: number;
  height?: number;
}

const FabricCanvas: React.FC<FabricCanvasProps> = ({
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new Canvas(canvasRef.current, {
        width,
        height,
      });

      return () => {
        fabricCanvasRef.current?.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, [width, height]);

  return (
    <div className="relative w-full h-full pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{ pointerEvents: "auto" }}
      />
     <ToolBar fabricCanvasRef={fabricCanvasRef} />
    </div>
  );
};

export default FabricCanvas;
