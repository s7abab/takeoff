import React, { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { MeasurementTool } from './utils/MeasurementTool';

interface MeasurementToolComponentProps {
  fabricCanvas: Canvas | null;
  isMeasuring: boolean;
  onToggleMeasure: () => void;
}

const MeasurementToolComponent: React.FC<MeasurementToolComponentProps> = ({
  fabricCanvas,
  isMeasuring,
  onToggleMeasure,
}) => {
  const measurementToolRef = useRef<MeasurementTool | null>(null);

  useEffect(() => {
    if (fabricCanvas) {
      measurementToolRef.current = new MeasurementTool(fabricCanvas);
    }

    return () => {
      if (measurementToolRef.current) {
        measurementToolRef.current.deactivate();
      }
    };
  }, [fabricCanvas]);

  return (
    <div>
      <button className='bg-slate-400' onClick={onToggleMeasure}>
        {isMeasuring ? 'Stop Measuring' : 'Start Measuring'}
      </button>
    </div>
  );
};

export default MeasurementToolComponent; 