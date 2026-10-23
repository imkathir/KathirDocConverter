import React, { useState } from 'react';
import {
  TargetFormat,
  ConversionOptions,
  ExtractedDocument
} from '../types/converter';
import { SUPPORTED_FORMATS } from '../utils/constants';
import {
  Download,
  Archive,
  Sliders,
  Check,
  FileText,
  FileSpreadsheet,
  FileCode,
  BookOpen,
  Image,
  Loader2
} from 'lucide-react';

interface FormatSelectorProps {
  selectedFormat: TargetFormat;
  onSelectFormat: (format: TargetFormat) => void;
  onDownloadFormat: (format: TargetFormat) => void;
  onDownloadAllZip: () => void;
  options: ConversionOptions;
  onOptionsChange: (newOptions: ConversionOptions) => void;
  isExporting: boolean;
  exportStatus: string;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onSelectFormat,
  onDownloadFormat,
  onDownloadAllZip,
  options,
  onOptionsChange,
  isExporting,
  exportStatus
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const getFormatIcon = (format: TargetFormat) => {
    switch (format) {
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'md':
      case 'html':
      case 'json':
        return <FileCode className="w-5 h-5 text-indigo-600" />;
      case 'epub':
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'images':
        return <Image className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const selectedDef = SUPPORTED_FORMATS.find(f => f.id === selectedFormat) || SUPPORTED_FORMATS[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Choose Conversion Format</h3>
          <p className="text-xs text-slate-500">
            Select an output target or package all formats into an archive.
          </p>
        </div>

        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            showAdvancedOptions
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Conversion Options</span>
        </button>
      </div>

      {/* Advanced Options Drawer */}
      {showAdvancedOptions && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
          <div className="font-semibold text-slate-800">Advanced Engine Preferences</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.smartTableDetection}
                onChange={(e) => onOptionsChange({ ...options, smartTableDetection: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <span className="text-slate-700">Smart Table Grid Extraction</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.detectHeadings}
                onChange={(e) => onOptionsChange({ ...options, detectHeadings: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <span className="text-slate-700">Typographic Heading Hierarchy (H1-H3)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.preservePageBreaks}
                onChange={(e) => onOptionsChange({ ...options, preservePageBreaks: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <span className="text-slate-700">Preserve PDF Page Breaks in Word/MD</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeHyphenation}
                onChange={(e) => onOptionsChange({ ...options, removeHyphenation: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <span className="text-slate-700">Repair End-of-Line Hyphenated Words</span>
            </label>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">CSV Delimiter:</span>
              <select
                value={options.tableExportDelimiter}
                onChange={(e) => onOptionsChange({ ...options, tableExportDelimiter: e.target.value as any })}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-600"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Image Render Scale:</span>
              <select
                value={options.imageScale}
                onChange={(e) => onOptionsChange({ ...options, imageScale: parseFloat(e.target.value) })}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-600"
              >
                <option value="1.5">1.5x (Standard 150 DPI)</option>
                <option value="2.0">2.0x (High-Res 200 DPI)</option>
                <option value="3.0">3.0x (Ultra 300 DPI)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Formats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {SUPPORTED_FORMATS.map((format) => {
          const isSelected = selectedFormat === format.id;
          return (
            <button
              key={format.id}
              onClick={() => onSelectFormat(format.id)}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getFormatIcon(format.id)}
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-700">
                    {format.extension}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                  {format.name.replace(/ \(.*\)/, '')}
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                {format.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Format Summary & Download Actions */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">{selectedDef.name}</span>
            <span className="text-[11px] font-mono text-indigo-600">{selectedDef.extension}</span>
          </div>
          <p className="text-xs text-slate-600">
            {selectedDef.description}
          </p>
          <div className="text-[11px] text-slate-400">
            Recommended for: {selectedDef.recommendedFor}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onDownloadAllZip}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5 text-slate-500" />
            <span>Download All (.ZIP)</span>
          </button>

          <button
            onClick={() => onDownloadFormat(selectedFormat)}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{exportStatus || 'Generating...'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedDef.extension.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
