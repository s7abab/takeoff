import React, { useEffect, useRef, useState } from "react";
import { MeasurementTool } from "./MeasurementTool";
import { Canvas } from "fabric";

interface MeasurementCanvasProps {
  fabricCanvasRef: React.RefObject<Canvas | null>;
}

export default function MeasurementCanvas({
  fabricCanvasRef,
}: MeasurementCanvasProps) {
  const measurementToolRef = useRef<MeasurementTool | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const toggleMeasurementTool = () => {
    if (measurementToolRef.current) {
      if (!isMeasuring) {
        measurementToolRef.current.activate();
      } else {
        measurementToolRef.current.deactivate();
      }
      setIsMeasuring(!isMeasuring);
    }
  };

  useEffect(() => {
    if (fabricCanvasRef.current) {
      measurementToolRef.current = new MeasurementTool(fabricCanvasRef.current);
    }
    return () => {
      if (measurementToolRef.current) {
        measurementToolRef.current.deactivate();
      }
    };
  }, [fabricCanvasRef]);
  return (
    <>
      <div className="absolute top-2 left-2 z-20 pointer-events-auto">
        <button
          onClick={toggleMeasurementTool}
          className={`px-4 py-2 rounded ${
            isMeasuring
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isMeasuring ? "Stop Measuring" : "Measure"}
        </button>
      </div>
    </>
  );
}
