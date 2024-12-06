'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';
import { MeasurementTool } from './MeasurementTool';

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
  const [isMeasuring, setIsMeasuring] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new Canvas(canvasRef.current, {
        width,
        height,
      });

      // Initialize measurement tool
      measurementToolRef.current = new MeasurementTool(fabricCanvasRef.current);

      return () => {
        if (measurementToolRef.current) {
          measurementToolRef.current.deactivate();
        }
        fabricCanvasRef.current?.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, [width, height]);

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

  return (
    <div className="relative w-full h-full pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0"
        style={{ pointerEvents: 'auto' }}
      />
      <div className="absolute top-2 left-2 z-20 pointer-events-auto">
        <button
          onClick={toggleMeasurementTool}
          className={`px-4 py-2 rounded ${
            isMeasuring 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isMeasuring ? 'Stop Measuring' : 'Measure'}
        </button>
      </div>
    </div>
  );
};

export default FabricCanvas;
