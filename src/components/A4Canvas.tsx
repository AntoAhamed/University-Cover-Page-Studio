import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CanvasElement, PageSettings } from '../types';
import { 
  Trash2, 
  Copy, 
  AlignCenterHorizontal, 
  Lock, 
  Unlock,
  Type,
  Bold,
  Italic,
  Underline,
  Superscript,
  Palette,
  Check,
  RemoveFormatting,
  ChevronLeft,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// Exact CSS conversion: 96 pixels per inch / 25.4 mm per inch
export const MM_TO_PX = 3.7795275591;

interface A4CanvasProps {
  elements: CanvasElement[];
  pageSettings: PageSettings;
  selectedId: string | null;
  zoom: number; // e.g. 0.85
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>, saveHistory?: boolean) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onSwitchToPanel?: () => void;
}

export const A4Canvas: React.FC<A4CanvasProps> = ({
  elements,
  pageSettings,
  selectedId,
  zoom,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onSwitchToPanel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'se' | 'sw' | 'e' | null>(null);
  const [startDim, setStartDim] = useState<{ width: number; height?: number; x: number; y: number }>({ width: 0, x: 0, y: 0 });

  // Alignment guide indicator
  const [guideLineX, setGuideLineX] = useState<number | null>(null);

  // Direct rich-text editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const selectedElement = elements.find((el) => el.id === selectedId);

  // Canvas dimensions in pixels at 1:1 scale
  const canvasWidthPx = pageSettings.width * MM_TO_PX;
  const canvasHeightPx = pageSettings.height * MM_TO_PX;

  // Handle pointer down on element to start drag
  const handleElementPointerDown = (e: React.PointerEvent, element: CanvasElement) => {
    // If currently editing text, don't drag
    if (editingId === element.id) return;

    e.stopPropagation();
    if (element.isLocked) {
      onSelectElement(element.id);
      return;
    }

    onSelectElement(element.id);
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setElementStartPos({ x: element.x, y: element.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Handle resize handle pointer down
  const handleResizePointerDown = (e: React.PointerEvent, handle: 'nw' | 'ne' | 'se' | 'sw' | 'e') => {
    e.stopPropagation();
    if (!selectedElement) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setStartDim({
      width: selectedElement.width,
      height: selectedElement.height,
      x: selectedElement.x,
      y: selectedElement.y
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Global Pointer Move for drag / resize
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging && selectedElement) {
      const deltaXPx = e.clientX - dragStartPos.x;
      const deltaYPx = e.clientY - dragStartPos.y;

      let newX = elementStartPos.x + (deltaXPx / (MM_TO_PX * zoom));
      let newY = elementStartPos.y + (deltaYPx / (MM_TO_PX * zoom));

      // Grid Snapping
      if (pageSettings.snapToGrid) {
        const grid = pageSettings.gridSize;
        newX = Math.round(newX / grid) * grid;
        newY = Math.round(newY / grid) * grid;
      }

      // Center snap detection
      const elementCenterX = newX + selectedElement.width / 2;
      const pageCenterX = pageSettings.width / 2;
      
      if (Math.abs(elementCenterX - pageCenterX) < 2) {
        newX = pageCenterX - selectedElement.width / 2;
        setGuideLineX(pageCenterX);
      } else if (Math.abs(newX - 25) < 2) {
        newX = 25;
        setGuideLineX(25);
      } else if (Math.abs(newX - 28) < 2) {
        newX = 28;
        setGuideLineX(28);
      } else {
        setGuideLineX(null);
      }

      // Constrain within page bounds
      newX = Math.max(0, Math.min(newX, pageSettings.width - 10));
      newY = Math.max(0, Math.min(newY, pageSettings.height - 10));

      onUpdateElement(selectedElement.id, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10
      }, false);
    } else if (isResizing && selectedElement && resizeHandle) {
      const deltaXPx = e.clientX - dragStartPos.x;
      const deltaYPx = e.clientY - dragStartPos.y;
      const deltaXmm = deltaXPx / (MM_TO_PX * zoom);
      const deltaYmm = deltaYPx / (MM_TO_PX * zoom);

      if (resizeHandle === 'e' || resizeHandle === 'se') {
        const newWidth = Math.max(20, startDim.width + deltaXmm);
        const updates: Partial<CanvasElement> = { width: Math.round(newWidth * 10) / 10 };
        if (selectedElement.height && resizeHandle === 'se') {
          const newHeight = Math.max(15, (startDim.height || 40) + deltaYmm);
          updates.height = Math.round(newHeight * 10) / 10;
        }
        onUpdateElement(selectedElement.id, updates, false);
      }
    }
  }, [isDragging, isResizing, selectedElement, dragStartPos, elementStartPos, startDim, zoom, pageSettings, resizeHandle, onUpdateElement]);

  const handlePointerUp = useCallback(() => {
    if (isDragging && selectedElement) {
      setIsDragging(false);
      setGuideLineX(null);
      onUpdateElement(selectedElement.id, { x: selectedElement.x, y: selectedElement.y }, true);
    }
    if (isResizing && selectedElement) {
      setIsResizing(false);
      setResizeHandle(null);
      onUpdateElement(selectedElement.id, { width: selectedElement.width, height: selectedElement.height }, true);
    }
  }, [isDragging, isResizing, selectedElement, onUpdateElement]);

  // Click on background deselects
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === containerRef.current) {
      onSelectElement(null);
      setEditingId(null);
    }
  };

  // Rich-text formatting command executer
  const executeFormatCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editableRef.current && editingId) {
      const updatedHtml = editableRef.current.innerHTML;
      onUpdateElement(editingId, { content: updatedHtml }, true);
    }
  };

  // Focus editable element when entering edit mode
  useEffect(() => {
    if (editingId && editableRef.current) {
      editableRef.current.focus();
    }
  }, [editingId]);

  // Render borders
  const renderBorder = () => {
    const { borderStyle, borderColor, borderWidth, borderMargin } = pageSettings;
    if (borderStyle === 'none') return null;

    const marginPx = borderMargin * MM_TO_PX;
    const borderThicknessPx = Math.max(1, borderWidth * MM_TO_PX);

    if (borderStyle === 'double') {
      return (
        <div
          className="absolute pointer-events-none"
          style={{
            top: `${marginPx}px`,
            left: `${marginPx}px`,
            right: `${marginPx}px`,
            bottom: `${marginPx}px`,
            border: `${borderThicknessPx * 2}px double ${borderColor}`,
            padding: '3px'
          }}
        >
          <div
            className="w-full h-full"
            style={{
              border: `1px solid ${borderColor}`,
              opacity: 0.8
            }}
          />
        </div>
      );
    }

    if (borderStyle === 'classic') {
      return (
        <div
          className="absolute pointer-events-none"
          style={{
            top: `${marginPx}px`,
            left: `${marginPx}px`,
            right: `${marginPx}px`,
            bottom: `${marginPx}px`,
            border: `${borderThicknessPx * 1.5}px solid ${borderColor}`,
            outline: `1px solid ${borderColor}`,
            outlineOffset: '4px'
          }}
        />
      );
    }

    // Default single solid border
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          top: `${marginPx}px`,
          left: `${marginPx}px`,
          right: `${marginPx}px`,
          bottom: `${marginPx}px`,
          border: `${borderThicknessPx}px solid ${borderColor}`
        }}
      />
    );
  };

  // Texture class
  const getTextureClass = () => {
    if (pageSettings.backgroundTexture === 'linen') return 'texture-linen';
    if (pageSettings.backgroundTexture === 'dots') return 'texture-dots';
    if (pageSettings.backgroundTexture === 'parchment') return 'texture-parchment';
    return '';
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full overflow-auto bg-slate-900/90 flex flex-col items-center justify-start py-8 px-4 pb-20 lg:pb-8 select-none"
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Visual Alignment Guides */}
      {guideLineX !== null && (
        <div
          className="alignment-guide absolute top-0 bottom-0 pointer-events-none z-50 border-r-2 border-dashed border-rose-500 shadow-sm"
          style={{
            left: `calc(50% - ${(canvasWidthPx * zoom) / 2}px + ${guideLineX * MM_TO_PX * zoom}px)`
          }}
        >
          <span className="absolute top-2 -left-6 bg-rose-600 text-white text-[10px] px-1 rounded shadow">
            {Math.round(guideLineX)}mm
          </span>
        </div>
      )}

      {/* A4 Page Container */}
      <div
        id="a4-print-target"
        ref={canvasRef}
        className={`relative bg-white text-slate-900 shadow-2xl transition-shadow transition-transform duration-75 origin-top ${getTextureClass()}`}
        style={{
          width: `${canvasWidthPx}px`,
          height: `${canvasHeightPx}px`,
          minWidth: `${canvasWidthPx}px`,
          minHeight: `${canvasHeightPx}px`,
          transform: `scale(${zoom})`,
          backgroundColor: pageSettings.backgroundColor,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
        onClick={handleCanvasClick}
      >
        {/* Millimeter Grid Overlay (Optional) */}
        {pageSettings.showGrid && (
          <div
            className="canvas-grid absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #0284c7 1px, transparent 1px),
                linear-gradient(to bottom, #0284c7 1px, transparent 1px)
              `,
              backgroundSize: `${pageSettings.gridSize * MM_TO_PX}px ${pageSettings.gridSize * MM_TO_PX}px`
            }}
          />
        )}

        {/* Page Borders */}
        {renderBorder()}

        {/* Canvas Elements */}
        {elements.map((element) => {
          const isSelected = element.id === selectedId;
          const isEditing = element.id === editingId;
          const leftPx = element.x * MM_TO_PX;
          const topPx = element.y * MM_TO_PX;
          const widthPx = element.width * MM_TO_PX;
          const heightPx = element.height ? element.height * MM_TO_PX : undefined;

          return (
            <div
              key={element.id}
              id={`canvas-el-${element.id}`}
              className={`absolute group transition-[outline,background-color] duration-150 ${
                isEditing
                  ? 'ring-2 ring-indigo-500 bg-white/90 z-50 cursor-text'
                  : isSelected
                  ? 'ring-2 ring-indigo-500 bg-indigo-500/5 z-40 cursor-move'
                  : 'hover:ring-1 hover:ring-sky-400/50 hover:bg-sky-500/5 z-10 cursor-move'
              }`}
              style={{
                left: `${leftPx}px`,
                top: `${topPx}px`,
                width: `${widthPx}px`,
                height: heightPx ? `${heightPx}px` : 'auto',
                zIndex: isEditing ? 60 : isSelected ? 50 : element.zIndex
              }}
              onPointerDown={(e) => handleElementPointerDown(e, element)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (element.type === 'text') {
                  setEditingId(element.id);
                }
              }}
            >
              {/* Element Rendering: Logo vs Rich-Text */}
              {element.type === 'logo' ? (
                <div className="w-full h-full flex items-center justify-center p-1 select-none pointer-events-none">
                  <img
                    src={element.content}
                    alt={element.label || 'University Logo'}
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : isEditing ? (
                /* Inline Rich-Text ContentEditable Container */
                <div
                  ref={editableRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full p-1 outline-none min-h-[28px] rich-text-content"
                  style={{
                    fontFamily: element.fontFamily,
                    fontSize: `${element.fontSize}pt`,
                    fontWeight: element.fontWeight,
                    fontStyle: element.fontStyle,
                    textDecoration: element.textDecoration,
                    textAlign: element.textAlign,
                    color: element.color,
                    lineHeight: element.lineHeight,
                    letterSpacing: `${element.letterSpacing}pt`,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                  onInput={(e) => {
                    onUpdateElement(element.id, { content: e.currentTarget.innerHTML }, false);
                  }}
                  onBlur={(e) => {
                    // Check if focus moved to the toolbar
                    if (toolbarRef.current?.contains(e.relatedTarget as Node)) {
                      return;
                    }
                    onUpdateElement(element.id, { content: e.currentTarget.innerHTML }, true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: element.content }}
                />
              ) : (
                /* Rendered Rich-Text Display */
                <div
                  className="w-full leading-tight select-none rich-text-content"
                  style={{
                    fontFamily: element.fontFamily,
                    fontSize: `${element.fontSize}pt`,
                    fontWeight: element.fontWeight,
                    fontStyle: element.fontStyle,
                    textDecoration: element.textDecoration,
                    textAlign: element.textAlign,
                    color: element.color,
                    lineHeight: element.lineHeight,
                    letterSpacing: `${element.letterSpacing}pt`,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: element.content || '<span class="text-slate-400 italic">[Empty text]</span>' }}
                />
              )}

              {/* Floating Rich-Text Formatting Toolbar when Editing */}
              {isEditing && (
                <div
                  ref={toolbarRef}
                  className="rich-toolbar no-print absolute -top-11 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-2xl flex items-center gap-1 z-50 text-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    title="Bold selected text"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeFormatCommand('bold');
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Italicize selected text"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeFormatCommand('italic');
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Underline selected text"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeFormatCommand('underline');
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Superscript (e.g. 18th)"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeFormatCommand('superscript');
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                  >
                    <Superscript className="w-3.5 h-3.5" />
                  </button>

                  {/* Text Color for Selection */}
                  <div className="relative">
                    <button
                      type="button"
                      title="Color selected text"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowColorPicker(!showColorPicker);
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                    >
                      <Palette className="w-3.5 h-3.5" />
                    </button>

                    {showColorPicker && (
                      <div className="absolute top-8 left-0 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-xl flex items-center gap-1.5 z-50">
                        {['#000000', '#0b3b82', '#991b1b', '#1e293b', '#b45309'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              executeFormatCommand('foreColor', c);
                              setShowColorPicker(false);
                            }}
                            className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    title="Clear format from selected text"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeFormatCommand('removeFormat');
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

                  {/* Done Editing Button */}
                  <button
                    type="button"
                    title="Done editing text"
                    onClick={() => setEditingId(null)}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Selection Border, Handles, and Quick Action Bar when Selected */}
              {isSelected && !isEditing && (
                <>
                  {/* Coordinate Badge */}
                  <div className="no-print absolute -top-6 left-0 bg-slate-900 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded shadow flex items-center gap-1 font-mono pointer-events-none">
                    <span>X: {Math.round(element.x)}mm</span>
                    <span>Y: {Math.round(element.y)}mm</span>
                    <span>W: {Math.round(element.width)}mm</span>
                  </div>

                  {/* Corner Resize Handles */}
                  <div
                    className="selection-handle absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-indigo-600 border-2 border-white rounded-sm cursor-se-resize shadow"
                    onPointerDown={(e) => handleResizePointerDown(e, 'se')}
                  />
                  <div
                    className="selection-handle absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-4 bg-indigo-600 border border-white rounded-sm cursor-e-resize shadow"
                    onPointerDown={(e) => handleResizePointerDown(e, 'e')}
                  />

                  {/* Quick Action Floating Bar */}
                  <div
                    className="no-print absolute -bottom-9 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-slate-200 border border-slate-700/80 rounded-lg px-2 py-1 shadow-xl flex items-center gap-1 z-50 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      title="Align Center Horizontally"
                      onClick={() => {
                        const newX = (pageSettings.width - element.width) / 2;
                        onUpdateElement(element.id, { x: Math.round(newX * 10) / 10 });
                      }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      <AlignCenterHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {element.type === 'text' && (
                      <button
                        title="Edit Text & Format Words"
                        onClick={() => setEditingId(element.id)}
                        className="p-1 hover:bg-slate-800 rounded text-indigo-300 hover:text-indigo-200"
                      >
                        <Type className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      title="Duplicate Element"
                      onClick={() => onDuplicateElement(element.id)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title={element.isLocked ? 'Unlock Element' : 'Lock Element'}
                      onClick={() => onUpdateElement(element.id, { isLocked: !element.isLocked })}
                      className={`p-1 hover:bg-slate-800 rounded ${element.isLocked ? 'text-amber-400' : 'text-slate-300 hover:text-white'}`}
                    >
                      {element.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />
                    <button
                      title="Delete Element"
                      onClick={() => onDeleteElement(element.id)}
                      className="p-1 hover:bg-rose-950/50 rounded text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Sticky Bottom Action Bar — visible only on small screens */}
      {onSwitchToPanel && (
        <div className="lg:hidden no-print fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 flex items-center justify-between px-4 py-2 gap-2 safe-bottom">
          <button
            onClick={onSwitchToPanel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Controls</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
            <button
              onClick={() => {
                const newZoom = Math.max(0.2, Math.round((zoom - 0.1) * 10) / 10);
                // We communicate zoom change upward through onSwitchToPanel's existence
                // For now we emit a custom event that App listens to
                window.dispatchEvent(new CustomEvent('canvas-zoom-change', { detail: newZoom }));
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-slate-300 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => {
                const newZoom = Math.min(2.0, Math.round((zoom + 0.1) * 10) / 10);
                window.dispatchEvent(new CustomEvent('canvas-zoom-change', { detail: newZoom }));
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {elements.length} el
          </div>
        </div>
      )}
    </div>
  );
};
