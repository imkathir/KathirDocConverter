import React from 'react';
import { X, Cpu, ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">System Architecture & Pipeline</h3>
              <p className="text-xs text-slate-500">How KathirDocConverter reads PDFs and converts them into multiple formats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
            <h4 className="font-semibold text-indigo-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Zero-Latency, Client-Side Privacy Architecture</span>
            </h4>
            <p>
              In this runtime environment, all PDF parsing and OpenXML document synthesis are performed using WebAssembly-accelerated stream processors in the browser. Your confidential files, contracts, and financial spreadsheets are never uploaded to third-party cloud servers.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm">Document Processing Stages:</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-mono text-indigo-600 font-semibold">01. Vector & Glyph Extraction</span>
                <p className="text-slate-500">
                  Mozilla PDF.js parses character streams, bounding boxes, transform matrices, and font weights.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-mono text-indigo-600 font-semibold">02. Typographic Clustering</span>
                <p className="text-slate-500">
                  Statistical mode analysis groups text into baselines, identifying H1-H3 headers, paragraphs, and list items.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-mono text-indigo-600 font-semibold">03. Table Matrix Alignment</span>
                <p className="text-slate-500">
                  Detects multi-column coordinates and aligns them into tabular grids suitable for Word and CSV sheets.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-mono text-indigo-600 font-semibold">04. OpenXML / Format Generation</span>
                <p className="text-slate-500">
                  Directly constructs ISO/IEC 29500-1 Word .docx packages, Word .doc envelopes, Markdown, HTML5, and EPUBs.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <h4 className="font-semibold text-slate-900">Supported Target Formats:</h4>
            <div className="flex flex-wrap gap-2 text-slate-700">
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.docx (OpenXML)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.doc (Word Legacy)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.md (CommonMark)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.html (Semantic HTML5)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.txt (UTF-8)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.csv (Tabular Sheets)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.json (Document AST)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.epub (eBook Reader)</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[11px]">.png/.jpg (Rendered Pages)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
