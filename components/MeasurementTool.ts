import { Canvas, Line, Textbox, Point } from 'fabric';

export class MeasurementTool {
  private canvas: Canvas;
  private isDrawing: boolean = false;
  private line: Line | null = null;
  private measurementText: Textbox | null = null;
  private startPoint: Point | null = null;
  private isActive: boolean = false;
  private boundMouseDown: any;
  private boundMouseMove: any;
  private boundMouseUp: any;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    // Bind event handlers
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  private onMouseDown(o: any) {
    if (!this.isActive) return;
    
    const pointer = this.canvas.getScenePoint(o.e);
    this.isDrawing = true;
    this.startPoint = pointer;

    this.line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
      stroke: '#333',
      strokeWidth: 2,
      selectable: true,
    });

    this.measurementText = new Textbox('0 px', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 14,
      fill: '#333',
      selectable: false,
      width: 100,
    });

    this.canvas.add(this.line);
    this.canvas.add(this.measurementText);
    this.canvas.renderAll();
  }

  private onMouseMove(o: any) {
    if (!this.isActive || !this.isDrawing) return;

    const pointer = this.canvas.getScenePoint(o.e);
    if (this.line && this.measurementText && this.startPoint) {
      this.line.set({
        x2: pointer.x,
        y2: pointer.y,
      });

      // Calculate distance
      const distance = Math.round(
        Math.sqrt(
          Math.pow(pointer.x - this.startPoint.x, 2) +
          Math.pow(pointer.y - this.startPoint.y, 2)
        )
      );

      // Update measurement text
      this.measurementText.set({
        text: `${distance} px`,
        left: (this.startPoint.x + pointer.x) / 2,
        top: (this.startPoint.y + pointer.y) / 2,
      });

      this.canvas.renderAll();
    }
  }

  private onMouseUp() {
    this.isDrawing = false;
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
    
    // Remove event listeners
    this.canvas.off('mouse:down', this.boundMouseDown);
    this.canvas.off('mouse:move', this.boundMouseMove);
    this.canvas.off('mouse:up', this.boundMouseUp);
  }
} 