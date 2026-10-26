import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Image as ImageIcon, 
  RotateCcw, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  GraduationCap,
  Loader2,
  MoreVertical,
  X
} from 'lucide-react';

interface NavbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetZoom: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetToDefault: () => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onPrint: () => void;
  isExportingPDF: boolean;
  isExportingPNG: boolean;
  exportStagePDF: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  zoom,
  onZoomChange,
  onResetZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetToDefault,
  onExportPDF,
  onExportPNG,
  onPrint,
  isExportingPDF,
  isExportingPNG,
  exportStagePDF
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 sm:px-4 z-30 select-none shadow-md shrink-0 relative">
      {/* Brand & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xs sm:text-sm text-white tracking-wide truncate max-w-[150px] sm:max-w-none">
              Cover Page Studio
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded">
              Jagannath University
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden xl:block">
            Vector-quality A4 layout designer & export engine
          </p>
        </div>
      </div>

      {/* Center: History & Zoom Controls (Desktop only) */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 shadow-sm">
        {/* Undo / Redo */}
        <button
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={onUndo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          title="Redo (Ctrl+Y)"
          disabled={!canRedo}
          onClick={onRedo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        {/* Zoom Controls */}
        <button
          title="Zoom Out"
          onClick={() => onZoomChange(Math.max(0.3, Math.round((zoom - 0.1) * 10) / 10))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          title="Fit Canvas / 100%"
          onClick={onResetZoom}
          className="text-xs font-mono font-medium text-slate-300 hover:text-indigo-400 px-1.5 min-w-[52px] text-center"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          title="Zoom In"
          onClick={() => onZoomChange(Math.min(2.0, Math.round((zoom + 0.1) * 10) / 10))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          title="Reset View to 100%"
          onClick={() => onZoomChange(1.0)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Undo/Redo compact for mobile */}
      <div className="flex lg:hidden items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
        <button
          title="Undo"
          disabled={!canUndo}
          onClick={onUndo}
          className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-25"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          title="Redo"
          disabled={!canRedo}
          onClick={onRedo}
          className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-25"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Reset Button (Desktop) */}
        <button
          onClick={onResetToDefault}
          title="Reset to default Assignment Cover.pdf layout"
          className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {/* Print Button (Desktop) */}
        <button
          onClick={onPrint}
          disabled={isExportingPDF || isExportingPNG}
          title="Print Document directly via browser"
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors disabled:opacity-50"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>

        {/* Export PNG (Desktop) */}
        <button
          onClick={onExportPNG}
          disabled={isExportingPNG || isExportingPDF}
          title="Download high-resolution PNG image"
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isExportingPNG ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>{isExportingPNG ? 'Saving...' : 'PNG'}</span>
        </button>

        {/* Download PDF (Primary Action - visible on all screens) */}
        <button
          onClick={onExportPDF}
          disabled={isExportingPDF || isExportingPNG}
          title="Download single-page vector A4 PDF"
          className="flex items-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isExportingPDF ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
          <span>{isExportingPDF ? exportStagePDF || 'Exporting...' : 'PDF'}</span>
        </button>

        {/* Mobile More Options Dropdown Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="More actions"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Actions Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-14 right-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onExportPNG();
            }}
            disabled={isExportingPNG || isExportingPDF}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors text-left"
          >
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onPrint();
            }}
            disabled={isExportingPNG || isExportingPDF}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors text-left"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Document</span>
          </button>

          <div className="h-[1px] bg-slate-800 my-1" />

          {/* Mobile Zoom Controls */}
          <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400">
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onZoomChange(Math.max(0.3, Math.round((zoom - 0.1) * 10) / 10))}
                className="p-1 hover:bg-slate-800 rounded text-slate-200"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onResetZoom}
                className="px-1.5 py-0.5 hover:bg-slate-800 rounded font-mono text-[10px] text-indigo-400"
              >
                Fit
              </button>
              <button
                onClick={() => onZoomChange(Math.min(2.0, Math.round((zoom + 0.1) * 10) / 10))}
                className="p-1 hover:bg-slate-800 rounded text-slate-200"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800 my-1" />

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onResetToDefault();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default Layout</span>
          </button>
        </div>
      )}
    </header>
  );
};
