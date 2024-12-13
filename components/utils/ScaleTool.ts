import { Canvas, Line, Textbox, Point, TEvent } from 'fabric';

export class ScaleTool {
  private canvas: Canvas;
  private isDrawing: boolean = false;
  private line: Line | null = null;
  private measurementText: Textbox | null = null;
  private startPoint: Point | null = null;
  private isActive: boolean = false;
  private boundMouseDown: (e: TEvent) => void;
  private boundMouseMove: (e: TEvent) => void;
  private boundMouseUp: (e: TEvent) => void;
  private pixelDistance: number = 0;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    // Bind event handlers
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  private onMouseDown(o: TEvent) {
    if (!this.isActive) return;
    
    const pointer = this.canvas.getScenePoint(o.e as MouseEvent);

    if (!this.isDrawing) {
      this.isDrawing = true;
      this.startPoint = pointer;

      this.line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: '#FF0000', // Red color for calibration line
        strokeWidth: 2,
        selectable: true,
      });

      const startMarker = new Line([
        pointer.x, pointer.y - 5,
        pointer.x, pointer.y + 5
      ], {
        stroke: '#FF0000',
        strokeWidth: 2,
        selectable: false,
      });

      this.measurementText = new Textbox('0 px', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 14,
        fill: '#FF0000',
        selectable: false,
        width: 100,
      });

      this.canvas.add(this.line);
      this.canvas.add(startMarker);
      this.canvas.add(this.measurementText);
    } 
    else if (this.isDrawing) {
      this.isDrawing = false;
      const pointer = this.canvas.getScenePoint(o.e as MouseEvent);
      
      if (this.line && this.startPoint) {
        this.pixelDistance = Math.round(
          Math.sqrt(
            Math.pow(pointer.x - this.startPoint.x, 2) +
            Math.pow(pointer.y - this.startPoint.y, 2)
          )
        );

        // Prompt user for known distance
        const knownDistance = prompt('Enter the known distance for this line (in feet):');
        
        if (knownDistance && !isNaN(Number(knownDistance))) {
          const feetDistance = parseFloat(knownDistance);
          
          // Calculate and store the scale
          const pixelsPerFoot = this.pixelDistance / feetDistance;
          
          // Store in localStorage
          localStorage.setItem('calibrationScale', JSON.stringify({
            pixelDistance: this.pixelDistance,
            feetDistance: feetDistance,
            pixelsPerFoot: pixelsPerFoot
          }));

          alert(`Calibration complete: ${this.pixelDistance} pixels = ${feetDistance} feet`);
        } else {
          alert('Invalid distance. Calibration cancelled.');
        }
      }

      // Remove temporary drawing elements
      if (this.line) this.canvas.remove(this.line);
      if (this.measurementText) this.canvas.remove(this.measurementText);
      
      this.line = null;
      this.measurementText = null;
      this.startPoint = null;
    }

    this.canvas.renderAll();
  }

  private onMouseMove(o: TEvent) {
    if (!this.isActive || !this.isDrawing) return;

    const pointer = this.canvas.getScenePoint(o.e as MouseEvent);
    if (this.line && this.measurementText && this.startPoint) {
      this.line.set({
        x2: pointer.x,
        y2: pointer.y,
      });

      const endMarker = new Line([
        pointer.x, pointer.y - 5,
        pointer.x, pointer.y + 5
      ], {
        stroke: '#FF0000',
        strokeWidth: 2,
        selectable: false,
      });

      const objects = this.canvas.getObjects();
      const lastObject = objects[objects.length - 1];
      if (lastObject instanceof Line && lastObject !== this.line) {
        this.canvas.remove(lastObject);
      }

      this.canvas.add(endMarker);

      const distance = Math.round(
        Math.sqrt(
          Math.pow(pointer.x - this.startPoint.x, 2) +
          Math.pow(pointer.y - this.startPoint.y, 2)
        )
      );

      this.measurementText.set({
        text: `${distance} px`,
        left: (this.startPoint.x + pointer.x) / 2,
        top: (this.startPoint.y + pointer.y) / 2,
      });

      this.canvas.renderAll();
    }
  }

  private onMouseUp() {
    // Keep empty or remove if not needed
  }

  public activate() {
    this.isActive = true;
    this.canvas.defaultCursor = 'crosshair';
    this.canvas.selection = false;
    
    // Add event listeners
    this.canvas.on('mouse:down', this.boundMouseDown);
    this.canvas.on('mouse:move', this.boundMouseMove);
    this.canvas.on('mouse:up', this.boundMouseUp);
  }

  public deactivate() {
    this.isActive = false;
    this.canvas.defaultCursor = 'default';
    this.canvas.selection = true;
    
    // Reset all drawing states
    this.isDrawing = false;
    this.line = null;
    this.measurementText = null;
    this.startPoint = null;
    
    // Remove event listeners
    this.canvas.off('mouse:down', this.boundMouseDown);
    this.canvas.off('mouse:move', this.boundMouseMove);
    this.canvas.off('mouse:up', this.boundMouseUp);
  }

  // Method to get the current calibration
  public getCalibration(): { pixelsPerFoot: number, isCalibrated: boolean } {
    const calibrationData = localStorage.getItem('calibrationScale');
    
    if (calibrationData) {
      const { pixelsPerFoot } = JSON.parse(calibrationData);
      return { 
        pixelsPerFoot, 
        isCalibrated: true 
      };
    }
    
    return { 
      pixelsPerFoot: 0, 
      isCalibrated: false 
    };
  }

  // Method to convert pixels to feet based on calibration
  public pixelsToFeet(pixels: number): number {
    const calibration = this.getCalibration();
    
    if (!calibration.isCalibrated) {
      throw new Error('Scale not calibrated. Please calibrate first.');
    }
    
    return pixels / calibration.pixelsPerFoot;
  }

  // Method to clear calibration
  public clearCalibration() {
    localStorage.removeItem('calibrationScale');
    alert('Calibration has been reset.');
  }
}