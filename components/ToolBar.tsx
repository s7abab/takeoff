import { Canvas } from "fabric";
import React from "react";
import MeasurementCanvas from "./MeasurementToolCanvas";

interface Props {
  fabricCanvasRef: React.RefObject<Canvas | null>;
}
export default function ToolBar({ fabricCanvasRef }: Props) {
  return (
    <>
      <MeasurementCanvas fabricCanvasRef={fabricCanvasRef} />;
    </>
  );
}
