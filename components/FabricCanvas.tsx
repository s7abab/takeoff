"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import { MeasurementTool } from "./utils/MeasurementTool";
import { ScaleTool } from "./utils/ScaleTool";

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
  const measurementToolRef = useRef<MeasurementTool | null>(null);
  const scaleToolRef = useRef<ScaleTool | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new Canvas(canvasRef.current, {
        width,
        height,
      });

      // Initialize tools
      measurementToolRef.current = new MeasurementTool(fabricCanvasRef.current);
      scaleToolRef.current = new ScaleTool(fabricCanvasRef.current);

      // Check initial calibration status
      const calibration = scaleToolRef.current.getCalibration();
      setIsCalibrated(calibration.isCalibrated);

      return () => {
        if (measurementToolRef.current) {
          measurementToolRef.current.deactivate();
        }
        if (scaleToolRef.current) {
          scaleToolRef.current.deactivate();
        }
        fabricCanvasRef.current?.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, [width, height]);

  const toggleMeasurementTool = () => {
    if (measurementToolRef.current) {
      // Deactivate calibration if active
      if (isCalibrating) {
        setIsCalibrating(false);
        scaleToolRef.current?.deactivate();
      }

      if (!isMeasuring) {
        measurementToolRef.current.activate();
      } else {
        measurementToolRef.current.deactivate();
      }
      setIsMeasuring(!isMeasuring);
    }
  };

  const toggleCalibrationTool = () => {
    if (scaleToolRef.current) {
      // Deactivate measurement if active
      if (isMeasuring) {
        setIsMeasuring(false);
        measurementToolRef.current?.deactivate();
      }

      if (!isCalibrating) {
        scaleToolRef.current.activate();
      } else {
        scaleToolRef.current.deactivate();
      }
      setIsCalibrating(!isCalibrating);
    }
  };

  const clearCalibration = () => {
    if (scaleToolRef.current) {
      scaleToolRef.current.clearCalibration();
      setIsCalibrated(false);
    }
  };

  return (
    <div className="relative w-full h-full pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{ pointerEvents: "auto" }}
      />
      <div className="absolute top-2 left-2 z-20 flex gap-2 pointer-events-auto">
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
        <button
          onClick={toggleCalibrationTool}
          className={`px-4 py-2 rounded ${
            isCalibrating
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-orange-500 hover:bg-orange-600"
          } text-white`}
        >
          {isCalibrating ? "Stop Calibrating" : "Calibrate"}
        </button>
        {isCalibrated && (
          <button
            onClick={clearCalibration}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
          >
            Clear Calibration
          </button>
        )}
      </div>
    </div>
  );
};

export default FabricCanvas;