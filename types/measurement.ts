export interface Point {
  x: number;
  y: number;
}

export interface MeasurementLine {
  id: string;
  points: Point[];
  length: number;
  scale?: number;
  unit: 'px' | 'mm' | 'cm' | 'm' | 'ft';
}

export interface MeasurementState {
  isDrawing: boolean;
  activeUnit: 'px' | 'mm' | 'cm' | 'm' | 'ft';
  scale: number;
  measurements: MeasurementLine[];
} 