export type ElementType = 'text' | 'logo' | 'divider' | 'box';

export type FontFamily = 
  | 'Times New Roman, Times, serif'
  | 'Georgia, serif'
  | 'Garamond, serif'
  | 'Arial, Helvetica, sans-serif'
  | 'Calibri, sans-serif'
  | 'Roboto, sans-serif'
  | 'Merriweather, serif'
  | 'Montserrat, sans-serif';

export interface CanvasElement {
  id: string;
  type: ElementType;
  label?: string; // e.g. "Course Name", "Student ID", "University Name"
  x: number; // in millimeters (mm)
  y: number; // in millimeters (mm)
  width: number; // in millimeters (mm)
  height?: number; // in millimeters (mm)
  content: string; // Text content or SVG/image URL
  fontFamily: string;
  fontSize: number; // in points (pt)
  fontWeight: 'normal' | '500' | '600' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  lineHeight: number;
  letterSpacing: number; // in pt
  zIndex: number;
  isLocked?: boolean;
  category?: 'header' | 'logo' | 'program' | 'course' | 'submitted_to' | 'submitted_by' | 'submission_date' | 'custom';
}

export interface PageSettings {
  width: number; // 210mm for A4
  height: number; // 297mm for A4
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  backgroundColor: string;
  backgroundTexture?: 'none' | 'linen' | 'dots' | 'parchment';
  borderStyle: 'none' | 'single' | 'double' | 'classic' | 'modern' | 'certificate';
  borderColor: string;
  borderWidth: number; // in mm
  borderMargin: number; // in mm from edge
  showGrid: boolean;
  gridSize: number; // in mm (e.g. 5mm or 10mm)
  snapToGrid: boolean;
}

export interface CoverTemplate {
  id: string;
  name: string;
  universityName: string;
  department: string;
  description: string;
  elements: CanvasElement[];
  pageSettings: PageSettings;
}
