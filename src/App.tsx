import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { CanvasElement, PageSettings, CoverTemplate } from './types';
import { 
  DEFAULT_ELEMENTS, 
  DEFAULT_PAGE_SETTINGS 
} from './constants/defaultTemplate';
import { useHistory } from './hooks/useHistory';
import { Navbar } from './components/Navbar';
import { ControlPanel } from './components/ControlPanel';
import { A4Canvas } from './components/A4Canvas';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { exportToA4PDF, exportToPNG } from './utils/pdfExport';

export function App() {
  // Elements state with Undo / Redo history
  const {
    state: elements,
    set: setElements,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetElements
  } = useHistory<CanvasElement[]>(DEFAULT_ELEMENTS);

  // Page Settings state
  const [pageSettings, setPageSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);

  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Mobile view: 'panel' shows ControlPanel, 'canvas' shows A4Canvas
  const [mobileView, setMobileView] = useState<'panel' | 'canvas'>('panel');

  // Zoom level (0.85 default for comfortable fitting on typical 1080p monitors)
  const [zoom, setZoom] = useState<number>(0.85);

  // Independent export states for PDF & PNG
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [exportStagePDF, setExportStagePDF] = useState<string>('');
  const [isExportingPNG, setIsExportingPNG] = useState<boolean>(false);

  // Confirmation Modal state for Reset to Default
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Update a single element
  const handleUpdateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>, saveHistory = true) => {
      setElements((prev) => {
        return prev.map((el) => (el.id === id ? { ...el, ...updates } : el));
      }, saveHistory);
    },
    [setElements]
  );

  // Add new element
  const handleAddElement = useCallback(
    (type: 'text' | 'logo', category: CanvasElement['category'] = 'custom') => {
      const newId = `el-${Date.now()}`;
      const newElement: CanvasElement = {
        id: newId,
        type,
        label: 'Custom Text Field',
        category,
        content: 'New Text Field',
        x: 28,
        y: 150,
        width: 154,
        fontSize: 14,
        fontFamily: 'Times New Roman, Times, serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'left',
        color: '#000000',
        lineHeight: 1.3,
        letterSpacing: 0,
        zIndex: elements.length + 1
      };

      setElements((prev) => [...prev, newElement], true);
      setSelectedId(newId);
    },
    [elements.length, setElements]
  );

  // Delete element
  const handleDeleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id), true);
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [selectedId, setElements]
  );

  // Duplicate element
  const handleDuplicateElement = useCallback(
    (id: string) => {
      const target = elements.find((el) => el.id === id);
      if (!target) return;

      const dupId = `el-${Date.now()}`;
      const duplicate: CanvasElement = {
        ...target,
        id: dupId,
        label: `${target.label || 'Field'} (Copy)`,
        x: Math.min(210 - target.width, target.x + 5),
        y: Math.min(297 - 10, target.y + 5),
        zIndex: elements.length + 1
      };

      setElements((prev) => [...prev, duplicate], true);
      setSelectedId(dupId);
    },
    [elements, setElements]
  );

  // Trigger Confirmation Modal for Reset
  const handleOpenResetModal = useCallback(() => {
    setIsResetModalOpen(true);
  }, []);

  // Confirmed Reset Execution
  const handleConfirmReset = useCallback(() => {
    resetElements(DEFAULT_ELEMENTS);
    setPageSettings(DEFAULT_PAGE_SETTINGS);
    setSelectedId(null);
    setIsResetModalOpen(false);
  }, [resetElements]);

  // Load a preset template
  const handleLoadTemplate = useCallback(
    (template: CoverTemplate) => {
      resetElements(template.elements);
      setPageSettings(template.pageSettings);
      setSelectedId(null);
    },
    [resetElements]
  );

  // Fit canvas dynamically based on viewport width/height (mobile-aware)
  const handleResetZoom = useCallback(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      // On mobile the canvas fills full width; fit to viewport width minus padding
      const availableWidth = window.innerWidth - 32; // 16px padding each side
      const fitted = Math.min(1.0, Math.max(0.2, availableWidth / (210 * 3.7795)));
      setZoom(Math.round(fitted * 100) / 100);
    } else {
      const availableHeight = window.innerHeight - 100;
      const fitted = Math.min(1.2, Math.max(0.4, availableHeight / 1123));
      setZoom(Math.round(fitted * 100) / 100);
    }
  }, []);

  // PDF Export Engine (Isolated & Handled Independently)
  const handleExportPDF = async () => {
    if (isExportingPDF || isExportingPNG) return;

    setIsExportingPDF(true);
    setExportStagePDF('Capturing...');
    try {
      // Temporarily deselect element during export
      setSelectedId(null);

      // Give React a microtask to re-render without selection handles
      await new Promise((r) => setTimeout(r, 100));

      await exportToA4PDF('a4-print-target', {
        filename: 'assignment-cover.pdf',
        onProgress: (stage) => setExportStagePDF(stage)
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate PDF document.';
      alert(message);
    } finally {
      setIsExportingPDF(false);
      setExportStagePDF('');
    }
  };

  // PNG Export Engine (Isolated & Handled Independently)
  const handleExportPNG = async () => {
    if (isExportingPNG || isExportingPDF) return;

    setIsExportingPNG(true);
    try {
      // Temporarily deselect element during export
      setSelectedId(null);

      // Give React a microtask to re-render without selection handles
      await new Promise((r) => setTimeout(r, 100));

      await exportToPNG('a4-print-target', 'cover-page.png');
    } catch (err) {
      console.error('PNG Export Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate PNG image.';
      alert(message);
    } finally {
      setIsExportingPNG(false);
    }
  };

  // Native Print
  const handlePrint = () => {
    setSelectedId(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea or contenteditable
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedId) handleDuplicateElement(selectedId);
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedId(null);
        return;
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteElement(selectedId);
        return;
      }

      // Arrow keys: Precision Nudging
      if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1; // 5mm with Shift, 1mm normal
        const selectedEl = elements.find((el) => el.id === selectedId);
        if (!selectedEl) return;

        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        const newX = Math.max(0, Math.min(210 - selectedEl.width, selectedEl.x + dx));
        const newY = Math.max(0, Math.min(297 - 10, selectedEl.y + dy));
        handleUpdateElement(selectedId, {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, undo, redo, handleDuplicateElement, handleDeleteElement, handleUpdateElement]);

  // Initial fit to screen
  useEffect(() => {
    handleResetZoom();
  }, [handleResetZoom]);

  // Listen for mobile canvas zoom events dispatched by A4Canvas bottom bar
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setZoom(customEvent.detail);
    };
    window.addEventListener('canvas-zoom-change', handler);
    return () => window.removeEventListener('canvas-zoom-change', handler);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Navigation */}
      <Navbar
        zoom={zoom}
        onZoomChange={setZoom}
        onResetZoom={handleResetZoom}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onResetToDefault={handleOpenResetModal}
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        onPrint={handlePrint}
        isExportingPDF={isExportingPDF}
        isExportingPNG={isExportingPNG}
        exportStagePDF={exportStagePDF}
      />

      {/* Main Split Screen Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Control Panel / Inspector — hidden on mobile when canvas view is active */}
        <div className={`${mobileView === 'canvas' ? 'hidden' : 'flex'} lg:flex w-full lg:w-auto flex-col h-full`}>
          <ControlPanel
            elements={elements}
            pageSettings={pageSettings}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onUpdateElement={handleUpdateElement}
            onAddElement={handleAddElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onUpdatePageSettings={(updates) => setPageSettings((prev) => ({ ...prev, ...updates }))}
            onResetToDefault={handleOpenResetModal}
            onLoadTemplate={handleLoadTemplate}
            onSwitchToPreview={() => setMobileView('canvas')}
          />
        </div>

        {/* Right Live A4 Preview Canvas — hidden on mobile when panel view is active */}
        <div className={`${mobileView === 'panel' ? 'hidden' : 'flex'} lg:flex flex-1 flex-col h-full min-w-0`}>
          <A4Canvas
            elements={elements}
            pageSettings={pageSettings}
            selectedId={selectedId}
            zoom={zoom}
            onSelectElement={setSelectedId}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onSwitchToPanel={() => setMobileView('panel')}
          />
        </div>
      </main>

      {/* Confirmation Modal for Reset to Default */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
      
      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
