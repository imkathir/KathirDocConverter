import React, { useState, useRef } from 'react';
import { Upload, FileUp, Sparkles, FileText, ArrowRight, Table, CheckCircle2 } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../utils/samplePdfs';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sampleId: string) => void;
  isLoading: boolean;
  loadingProgress: number;
  loadingStatus: string;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelect,
  onSampleSelect,
  isLoading,
  loadingProgress,
  loadingStatus
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Primary Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-white shadow-xs'
        } ${isLoading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="py-6 space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="truncate pr-4">{loadingStatus}</span>
              <span className="font-mono tabular-nums font-semibold text-indigo-600">{loadingProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-200 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Parsing vector glyphs, baseline alignments, and reconstructing tables...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileUp className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">
                Drop your PDF file here or browse
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Convert directly into Microsoft Word (.docx &amp; .doc), Markdown, HTML5, CSV tables, Plain Text, EPUB, and High-DPI images.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-mono">.docx</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">.doc</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">.md</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">.html</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">.csv</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">.json</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">.epub</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Select PDF from Computer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instant Realistic Test Samples */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-700">Don't have a PDF ready? Test with industry benchmark samples:</span>
          <span>Instant 1-Click Load</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelect(sample.id)}
              disabled={isLoading}
              className="group p-4 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-left transition-all hover:shadow-xs cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-medium text-indigo-600">
                  {sample.pagesCount} {sample.pagesCount === 1 ? 'Page' : 'Pages'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {sample.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights / Pipeline Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-slate-900">Genuine OpenXML Word Generation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creates true Microsoft Word XML structures (.docx and .doc) with native styles, headers, and cell formatting.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Table className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-slate-900">Automatic Table Grid Extraction</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Detects multi-column coordinates and converts financial or statistical grids into Excel-ready CSV and Word tables.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-slate-900">Zero-Server Data Confidentiality</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              All document conversion executes directly in your browser. Sensitive documents never leave your local device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
