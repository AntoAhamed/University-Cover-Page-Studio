import React, { useState, useRef } from 'react';
import { 
  CanvasElement, 
  PageSettings, 
  CoverTemplate 
} from '../types';
import { 
  FileText, 
  Sliders, 
  Square, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Copy, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Bold, 
  Italic, 
  Underline, 
  Superscript,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Sparkles,
  Info,
  Check,
  Palette,
  Layers,
  Eye
} from 'lucide-react';
import { JAGANNATH_UNIVERSITY_LOGO_DATA_URL } from '../assets/logos';
import { PRESET_TEMPLATES } from '../constants/defaultTemplate';

interface ControlPanelProps {
  elements: CanvasElement[];
  pageSettings: PageSettings;
  selectedId: string | null;
  activeTab?: 'content' | 'style' | 'page' | 'templates';
  onTabChange?: (tab: 'content' | 'style' | 'page' | 'templates') => void;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>, saveHistory?: boolean) => void;
  onAddElement: (type: 'text' | 'logo', category?: CanvasElement['category']) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onUpdatePageSettings: (settings: Partial<PageSettings>) => void;
  onResetToDefault: () => void;
  onLoadTemplate: (template: CoverTemplate) => void;
  onSwitchToPreview?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  elements,
  pageSettings,
  selectedId,
  activeTab: activeTabProp,
  onTabChange,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  onDuplicateElement,
  onUpdatePageSettings,
  onResetToDefault,
  onLoadTemplate,
  onSwitchToPreview
}) => {
  const [internalTab, setInternalTab] = useState<'content' | 'style' | 'page' | 'templates'>('content');
  const activeTab = activeTabProp || internalTab;
  const setActiveTab = (tab: 'content' | 'style' | 'page' | 'templates') => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };
  const [nudgeStep, setNudgeStep] = useState<number>(1); // mm
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedElement = elements.find((el) => el.id === selectedId);

  // Helper to get element by ID
  const getElement = (id: string) => elements.find((e) => e.id === id);

  // Nudge selected element
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedElement) return;
    const newX = Math.max(0, Math.min(210 - selectedElement.width, selectedElement.x + dx));
    const newY = Math.max(0, Math.min(297 - 10, selectedElement.y + dy));
    onUpdateElement(selectedElement.id, {
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10
    });
  };

  // Center horizontally
  const handleCenterElement = () => {
    if (!selectedElement) return;
    const newX = (pageSettings.width - selectedElement.width) / 2;
    onUpdateElement(selectedElement.id, { x: Math.round(newX * 10) / 10 });
  };

  // Wrap selected text inside textarea with tag (e.g. <b>...</b>)
  const wrapSelectedText = (openTag: string, closeTag: string) => {
    if (!textareaRef.current || !selectedElement) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedElement.content;

    if (start === end) {
      // No text selected, append tags at cursor
      const updated = text.slice(0, start) + openTag + closeTag + text.slice(end);
      onUpdateElement(selectedElement.id, { content: updated });
    } else {
      const selected = text.slice(start, end);
      const updated = text.slice(0, start) + openTag + selected + closeTag + text.slice(end);
      onUpdateElement(selectedElement.id, { content: updated });
    }
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const logoEl = elements.find((el) => el.type === 'logo') || selectedElement;
      if (logoEl) {
        onUpdateElement(logoEl.id, { content: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="control-panel w-full lg:w-[420px] lg:min-w-[380px] lg:max-w-[440px] h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 text-slate-200">
      {/* Mobile Top View Switcher */}
      {onSwitchToPreview && (
        <div className="lg:hidden p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-300 font-semibold">Cover Page Controls</span>
          <button
            onClick={onSwitchToPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Canvas</span>
          </button>
        </div>
      )}

      {/* Top Header Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'content'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Form Fields</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'style'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('page')}
          className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'page'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Square className="w-3.5 h-3.5" />
          <span>Framing & Page</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-5 pb-28 lg:pb-6">
        {/* TAB 1: FORM FIELDS */}
        {activeTab === 'content' && (
          <div className="space-y-5">
            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-indigo-300">Synchronized Real-Time Sync</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Edits below update canvas elements instantly. You can double-click any field on the preview to edit specific words with rich formatting!
                </p>
              </div>
            </div>

            {/* University & Department */}
            <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>University Header</span>
                <span className="text-[10px] text-indigo-400 font-mono">Top Block</span>
              </h3>
              
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">University Name</label>
                <input
                  type="text"
                  value={getElement('el-uni-name')?.content || ''}
                  onChange={(e) => onUpdateElement('el-uni-name', { content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Department / Faculty</label>
                <input
                  type="text"
                  value={getElement('el-dept-name')?.content || ''}
                  onChange={(e) => onUpdateElement('el-dept-name', { content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Program Title</label>
                <input
                  type="text"
                  value={getElement('el-program-title')?.content || ''}
                  onChange={(e) => onUpdateElement('el-program-title', { content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Course & Assignment Details */}
            <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Course & Assignment Details</span>
                <span className="text-[10px] text-indigo-400 font-mono">Left Aligned</span>
              </h3>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Course Name</label>
                <input
                  type="text"
                  value={getElement('el-course-name')?.content || ''}
                  onChange={(e) => onUpdateElement('el-course-name', { content: e.target.value })}
                  placeholder="Course Name: "
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Course Code</label>
                <input
                  type="text"
                  value={getElement('el-course-code')?.content || ''}
                  onChange={(e) => onUpdateElement('el-course-code', { content: e.target.value })}
                  placeholder="Course Code: "
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Assignment Topic</label>
                <input
                  type="text"
                  value={getElement('el-assignment-on')?.content || ''}
                  onChange={(e) => onUpdateElement('el-assignment-on', { content: e.target.value })}
                  placeholder="Assignment On: "
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submitted To Block */}
            <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Submitted To
                </h3>
                <span className="text-[10px] text-indigo-400 font-mono">Instructor Info</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Section Heading</label>
                <input
                  type="text"
                  value={getElement('el-submitted-to-heading')?.content || ''}
                  onChange={(e) => onUpdateElement('el-submitted-to-heading', { content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Teacher Name</label>
                <input
                  type="text"
                  value={getElement('el-teacher-name')?.content || ''}
                  onChange={(e) => onUpdateElement('el-teacher-name', { content: e.target.value })}
                  placeholder="Name: "
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Designation</label>
                <input
                  type="text"
                  value={getElement('el-teacher-designation')?.content || ''}
                  onChange={(e) => onUpdateElement('el-teacher-designation', { content: e.target.value })}
                  placeholder="Designation: "
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Department</label>
                <input
                  type="text"
                  value={getElement('el-teacher-department')?.content || ''}
                  onChange={(e) => onUpdateElement('el-teacher-department', { content: e.target.value })}
                  placeholder="Department: "
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submitted By Block (Student Info) - Updated Defaults */}
            <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Submitted By
                </h3>
                <span className="text-[10px] text-indigo-400 font-mono">Student Info</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Section Heading</label>
                <input
                  type="text"
                  value={getElement('el-submitted-by-heading')?.content || ''}
                  onChange={(e) => onUpdateElement('el-submitted-by-heading', { content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Student Name</label>
                <input
                  type="text"
                  value={getElement('el-student-name')?.content || ''}
                  onChange={(e) => onUpdateElement('el-student-name', { content: e.target.value })}
                  placeholder="Name: Jems Bond"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Student ID</label>
                <input
                  type="text"
                  value={getElement('el-student-id')?.content || ''}
                  onChange={(e) => onUpdateElement('el-student-id', { content: e.target.value })}
                  placeholder="Student ID: M25080202569"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Section</label>
                  <input
                    type="text"
                    value={getElement('el-student-section')?.content || ''}
                    onChange={(e) => onUpdateElement('el-student-section', { content: e.target.value })}
                    placeholder="Section: F"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Batch</label>
                  <input
                    type="text"
                    value={getElement('el-student-batch')?.content || ''}
                    onChange={(e) => onUpdateElement('el-student-batch', { content: e.target.value })}
                    placeholder="Batch: 18th"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Date of Submission */}
            <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Submission Date
              </h3>
              <input
                type="text"
                value={getElement('el-date-submission')?.content || ''}
                onChange={(e) => onUpdateElement('el-date-submission', { content: e.target.value })}
                placeholder="Date of Submission: 25 October, 2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Add Custom Element Button */}
            <div className="pt-2">
              <button
                onClick={() => onAddElement('text', 'custom')}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Custom Text Field</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INSPECTOR & GRANULAR STYLING */}
        {activeTab === 'style' && (
          <div className="space-y-5">
            {!selectedElement ? (
              <div className="text-center py-10 px-4 bg-slate-800/20 border border-dashed border-slate-800 rounded-xl space-y-3">
                <Sliders className="w-8 h-8 text-slate-600 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-slate-300">No Element Selected</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click any text field, heading, or emblem on the canvas to inspect, nudge, and fine-tune its formatting.
                  </p>
                </div>
                {/* Element Picker Dropdown */}
                <div className="pt-2">
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">
                    Or select an element from list:
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-300"
                    onChange={(e) => onSelectElement(e.target.value || null)}
                    defaultValue=""
                  >
                    <option value="">-- Choose Element --</option>
                    {elements.map((el) => (
                      <option key={el.id} value={el.id}>
                        {el.label || el.content.substring(0, 24) || el.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Selected Element Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                      Selected Element
                    </span>
                    <h4 className="text-sm font-bold text-white truncate max-w-[220px]">
                      {selectedElement.label || selectedElement.id}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      title="Duplicate"
                      onClick={() => onDuplicateElement(selectedElement.id)}
                      className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => onDeleteElement(selectedElement.id)}
                      className="p-1.5 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Text Content & Rich-Text Word Formatter */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-2 bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-300 font-medium">
                        Text Content & Word Formatting
                      </label>
                      <span className="text-[10px] text-indigo-400 font-mono">HTML/Rich Text</span>
                    </div>

                    {/* Word Tag Wrap Quick Toolbar */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                      <button
                        type="button"
                        title="Wrap selected text in <b>bold</b>"
                        onClick={() => wrapSelectedText('<b>', '</b>')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Wrap selected text in <i>italics</i>"
                        onClick={() => wrapSelectedText('<i>', '</i>')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Wrap selected text in <u>underline</u>"
                        onClick={() => wrapSelectedText('<u>', '</u>')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Wrap in superscript <sup>th</sup>"
                        onClick={() => wrapSelectedText('<sup>', '</sup>')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                      >
                        <Superscript className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Wrap in primary color span"
                        onClick={() => wrapSelectedText('<span style="color: #0b3b82; font-weight: bold;">', '</span>')}
                        className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-[10px] text-sky-400 font-mono"
                      >
                        Navy
                      </button>
                    </div>

                    <textarea
                      ref={textareaRef}
                      rows={3}
                      value={selectedElement.content}
                      onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                      placeholder="Type text or HTML tags..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />

                    {/* Live Formatted Output Preview */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Live Render:</span>
                      <div
                        className="text-white rich-text-content"
                        style={{ fontFamily: selectedElement.fontFamily }}
                        dangerouslySetInnerHTML={{ __html: selectedElement.content || '<span class="text-slate-500 italic">[Empty]</span>' }}
                      />
                    </div>
                  </div>
                )}

                {/* Precision Nudging & Millimeter Coordinates */}
                <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Precision Positioning (mm)
                    </h4>
                    {/* Step selector */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-500">Step:</span>
                      {[0.5, 1, 5].map((step) => (
                        <button
                          key={step}
                          onClick={() => setNudgeStep(step)}
                          className={`px-1.5 py-0.5 rounded font-mono ${
                            nudgeStep === step
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {step}mm
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* D-Pad Controller */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-1">
                    <div className="relative w-24 h-24 bg-slate-950 rounded-xl border border-slate-700 flex items-center justify-center shadow-inner shrink-0">
                      <button
                        title={`Nudge Up by ${nudgeStep}mm`}
                        onClick={() => handleNudge(0, -nudgeStep)}
                        className="absolute top-1 left-1/2 -translate-x-1/2 p-1.5 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded active:scale-95"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button
                        title={`Nudge Down by ${nudgeStep}mm`}
                        onClick={() => handleNudge(0, nudgeStep)}
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 p-1.5 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded active:scale-95"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                      <button
                        title={`Nudge Left by ${nudgeStep}mm`}
                        onClick={() => handleNudge(-nudgeStep, 0)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded active:scale-95"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        title={`Nudge Right by ${nudgeStep}mm`}
                        onClick={() => handleNudge(nudgeStep, 0)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded active:scale-95"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        title="Center Horizontally on A4 Page"
                        onClick={handleCenterElement}
                        className="w-6 h-6 bg-slate-800 hover:bg-indigo-600 rounded text-[9px] font-bold text-slate-300 hover:text-white flex items-center justify-center shadow"
                      >
                        C
                      </button>
                    </div>

                    {/* Numeric X & Y Inputs */}
                    <div className="flex sm:flex-col gap-3 sm:gap-2 text-xs w-full sm:w-auto justify-center">
                      <div className="flex-1 sm:flex-none">
                        <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">X (mm)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={selectedElement.x}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              x: Math.round(parseFloat(e.target.value || '0') * 10) / 10
                            })
                          }
                          className="w-full sm:w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                        />
                      </div>
                      <div className="flex-1 sm:flex-none">
                        <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Y (mm)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={selectedElement.y}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              y: Math.round(parseFloat(e.target.value || '0') * 10) / 10
                            })
                          }
                          className="w-full sm:w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Width & Height */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Width (mm)</span>
                      <input
                        type="number"
                        step="1"
                        value={selectedElement.width}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            width: Math.max(10, parseFloat(e.target.value || '10'))
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    {selectedElement.height !== undefined && (
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Height (mm)</span>
                        <input
                          type="number"
                          step="1"
                          value={selectedElement.height}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              height: Math.max(10, parseFloat(e.target.value || '10'))
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Typography Suite */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Typography & Style
                    </h4>

                    {/* Font Family */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Font Family</label>
                      <select
                        value={selectedElement.fontFamily}
                        onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Times New Roman, Times, serif">Times New Roman (Academic Standard)</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Garamond, serif">Garamond</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Merriweather', serif">Merriweather</option>
                        <option value="Arial, Helvetica, sans-serif">Arial (Modern Sans)</option>
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Montserrat', sans-serif">Montserrat</option>
                      </select>
                    </div>

                    {/* Font Size (pt) */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-medium">Font Size</span>
                        <span className="font-mono text-indigo-400 font-bold">{selectedElement.fontSize} pt</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateElement(selectedElement.id, { fontSize: Math.max(8, selectedElement.fontSize - 1) })}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center font-bold text-slate-300"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="8"
                          max="48"
                          step="0.5"
                          value={selectedElement.fontSize}
                          onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseFloat(e.target.value) })}
                          className="flex-1 accent-indigo-500"
                        />
                        <button
                          onClick={() => onUpdateElement(selectedElement.id, { fontSize: Math.min(60, selectedElement.fontSize + 1) })}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center font-bold text-slate-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Formatting Toggles */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        title="Bold"
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold'
                          })
                        }
                        className={`p-2 rounded-lg flex-1 flex items-center justify-center transition-colors ${
                          selectedElement.fontWeight === 'bold'
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>

                      <button
                        title="Italic"
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
                          })
                        }
                        className={`p-2 rounded-lg flex-1 flex items-center justify-center transition-colors ${
                          selectedElement.fontStyle === 'italic'
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>

                      <button
                        title="Underline"
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline'
                          })
                        }
                        className={`p-2 rounded-lg flex-1 flex items-center justify-center transition-colors ${
                          selectedElement.textDecoration === 'underline'
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Text Alignment</label>
                      <div className="flex items-center gap-1">
                        {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                          const Icon =
                            align === 'left'
                              ? AlignLeft
                              : align === 'center'
                              ? AlignCenter
                              : align === 'right'
                              ? AlignRight
                              : AlignJustify;
                          return (
                            <button
                              key={align}
                              onClick={() => onUpdateElement(selectedElement.id, { textAlign: align })}
                              className={`p-2 rounded-lg flex-1 flex items-center justify-center transition-colors ${
                                selectedElement.textAlign === align
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Default Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-slate-950 p-0.5"
                        />
                        <div className="flex items-center gap-1.5 flex-1">
                          {['#000000', '#0b3b82', '#991b1b', '#1e293b', '#334155', '#475569'].map((col) => (
                            <button
                              key={col}
                              onClick={() => onUpdateElement(selectedElement.id, { color: col })}
                              className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Line Height & Letter Spacing */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Line Height</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.8"
                          max="2.5"
                          value={selectedElement.lineHeight}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              lineHeight: parseFloat(e.target.value || '1.2')
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Letter Spacing (pt)</span>
                        <input
                          type="number"
                          step="0.1"
                          min="-2"
                          max="10"
                          value={selectedElement.letterSpacing}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              letterSpacing: parseFloat(e.target.value || '0')
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FRAMING & PAGE BACKGROUND UI (CLEANED UP & EXPANDED) */}
        {activeTab === 'page' && (
          <div className="space-y-4">
            {/* Academic Borders Card */}
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-3.5">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-indigo-400" />
                <span>Academic Border Style</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'None (Default)', desc: 'Clean, matches PDF' },
                  { id: 'single', label: 'Single Line', desc: 'Minimal solid frame' },
                  { id: 'double', label: 'Double Line', desc: 'Formal university frame' },
                  { id: 'classic', label: 'Classic Inset', desc: 'Framed academic border' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onUpdatePageSettings({ borderStyle: item.id as any })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      pageSettings.borderStyle === item.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              {pageSettings.borderStyle !== 'none' && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  {/* Border Color */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Border Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pageSettings.borderColor}
                        onChange={(e) => onUpdatePageSettings({ borderColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-slate-950 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={pageSettings.borderColor}
                        onChange={(e) => onUpdatePageSettings({ borderColor: e.target.value })}
                        className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase"
                      />
                      <div className="flex items-center gap-1.5 flex-1 justify-end">
                        {['#0b3b82', '#000000', '#b45309', '#991b1b', '#334155'].map((color) => (
                          <button
                            key={color}
                            onClick={() => onUpdatePageSettings({ borderColor: color })}
                            className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Border Width & Margin Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Thickness</span>
                        <span className="font-mono text-indigo-400">{pageSettings.borderWidth}mm</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="4.0"
                        step="0.2"
                        value={pageSettings.borderWidth}
                        onChange={(e) => onUpdatePageSettings({ borderWidth: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Margin</span>
                        <span className="font-mono text-indigo-400">{pageSettings.borderMargin}mm</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        step="1"
                        value={pageSettings.borderMargin}
                        onChange={(e) => onUpdatePageSettings({ borderMargin: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Page Background Paper & Texture Card */}
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-3.5">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paper Finish & Background</span>
              </h4>

              {/* Background Color Presets */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-400 font-medium">Paper Tone Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { color: '#ffffff', label: 'Pure White', desc: 'Standard print' },
                    { color: '#fcfbf7', label: 'Warm Cream', desc: 'Academic soft' },
                    { color: '#fafaf9', label: 'Ivory Document', desc: 'Classic official' }
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => onUpdatePageSettings({ backgroundColor: preset.color })}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        pageSettings.backgroundColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-400 shrink-0"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-[11px] font-semibold text-slate-200 truncate">{preset.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Custom Paper Color:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={pageSettings.backgroundColor}
                    onChange={(e) => onUpdatePageSettings({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-700 bg-slate-950 p-0.5"
                  />
                  <input
                    type="text"
                    value={pageSettings.backgroundColor}
                    onChange={(e) => onUpdatePageSettings({ backgroundColor: e.target.value })}
                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Background Texture Options */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Paper Texture Grain</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'none', label: 'Smooth' },
                    { id: 'linen', label: 'Linen' },
                    { id: 'dots', label: 'Dots' },
                    { id: 'parchment', label: 'Parchment' }
                  ].map((tex) => (
                    <button
                      key={tex.id}
                      onClick={() => onUpdatePageSettings({ backgroundTexture: tex.id as any })}
                      className={`py-1.5 px-2 rounded-lg text-center text-xs font-medium border transition-colors ${
                        (pageSettings.backgroundTexture || 'none') === tex.id
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Guides & Grid Card */}
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Alignment Guides & Grid</span>
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-200">Millimeter Grid Overlay</p>
                  <p className="text-[10px] text-slate-400">Visual helper grid (hidden in PDF download)</p>
                </div>
                <input
                  type="checkbox"
                  checked={pageSettings.showGrid}
                  onChange={(e) => onUpdatePageSettings({ showGrid: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <div>
                  <p className="text-xs font-medium text-slate-200">Snap to Grid</p>
                  <p className="text-[10px] text-slate-400">Elements snap while dragging</p>
                </div>
                <input
                  type="checkbox"
                  checked={pageSettings.snapToGrid}
                  onChange={(e) => onUpdatePageSettings({ snapToGrid: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {pageSettings.showGrid && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-400 text-[11px]">Grid Spacing</span>
                  <div className="flex items-center gap-1">
                    {[2, 5, 10].map((size) => (
                      <button
                        key={size}
                        onClick={() => onUpdatePageSettings({ gridSize: size })}
                        className={`px-2 py-0.5 rounded font-mono text-xs ${
                          pageSettings.gridSize === size
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {size}mm
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TEMPLATES & LOGOS */}
        {activeTab === 'templates' && (
          <div className="space-y-5">
            {/* University Logo Manager */}
            <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>University Emblem</span>
                <ImageIcon className="w-4 h-4 text-indigo-400" />
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center border border-slate-700 shadow-sm">
                  <img
                    src={getElement('el-uni-logo')?.content || JAGANNATH_UNIVERSITY_LOGO_DATA_URL}
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block">
                    <span className="inline-block py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer shadow">
                      Upload Custom Logo (PNG / SVG)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => onUpdateElement('el-uni-logo', { content: JAGANNATH_UNIVERSITY_LOGO_DATA_URL })}
                    className="text-[11px] text-slate-400 hover:text-indigo-400 underline block"
                  >
                    Restore Official Jagannath Emblem
                  </button>
                </div>
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Preset Cover Layouts
              </h4>

              {PRESET_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-slate-800/40 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{tmpl.name}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tmpl.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <button
                      onClick={() => onLoadTemplate(tmpl)}
                      className="py-1 px-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                    >
                      Apply Layout
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset to Default Template Button (Triggers Confirmation Modal) */}
            <div className="pt-2">
              <button
                onClick={onResetToDefault}
                className="w-full py-2.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Default Template</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
        <button
          onClick={onResetToDefault}
          title="Reset to exact Assignment Cover.pdf layout"
          className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Layout</span>
        </button>

        <span className="text-[11px] text-slate-500 font-mono">
          A4: 210 × 297 mm
        </span>
      </div>
    </div>
  );
};
