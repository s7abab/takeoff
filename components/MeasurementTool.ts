import { Canvas, Line, Textbox, Point, TEvent } from 'fabric';

export class MeasurementTool {
  private canvas: Canvas;
  private isDrawing: boolean = false;
  private line: Line | null = null;
  private measurementText: Textbox | null = null;
  private startPoint: Point | null = null;
  private isActive: boolean = false;
  private boundMouseDown: (e: TEvent) => void;
  private boundMouseMove: (e: TEvent) => void;
  private boundMouseUp: (e: TEvent) => void;
  private lines: Line[] = [];
  private measurementTexts: Textbox[] = [];

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
        stroke: '#00FF00',
        strokeWidth: 2,
        selectable: true,
      });

      const startMarker = new Line([
        pointer.x, pointer.y - 5,
        pointer.x, pointer.y + 5
      ], {
        stroke: '#00FF00',
        strokeWidth: 2,
        selectable: false,
      });

      this.measurementText = new Textbox('0 px', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 14,
        fill: '#00FF00',
        selectable: false,
        width: 100,
      });

      this.canvas.add(this.line);
      this.canvas.add(startMarker);
      this.canvas.add(this.measurementText);
    } 
    else if (this.isDrawing) {
      this.isDrawing = false;
      // Store the completed line and text
      if (this.line && this.measurementText) {
        this.lines.push(this.line);
        this.measurementTexts.push(this.measurementText);
      }
      // Reset current line and text without removing them from canvas
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
        stroke: '#00FF00',
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

  // Optional: Add method to clear all measurements
  public clearMeasurements() {
    this.lines.forEach(line => this.canvas.remove(line));
    this.measurementTexts.forEach(text => this.canvas.remove(text));
    this.lines = [];
    this.measurementTexts = [];
    this.canvas.renderAll();
  }
} 