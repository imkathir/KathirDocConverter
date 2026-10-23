import React from 'react';
import { FileText, Upload, Layers, Clock, Settings2 } from 'lucide-react';
import { LogoIcon } from './Logo';

interface HeaderProps {
  activeTab: 'converter' | 'preview' | 'batch' | 'history';
  setActiveTab: (tab: 'converter' | 'preview' | 'batch' | 'history') => void;
  onNewUploadClick: () => void;
  hasDocument: boolean;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewUploadClick,
  hasDocument,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Single text element wordmark with custom K insignia */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('converter');
        }}
        className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group"
      >
        <LogoIcon size={32} />
        <span>Kathir<span className="text-indigo-600 font-extrabold">Doc</span>Converter</span>
      </a>

      {/* Zone 2: 4 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('converter')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
            activeTab === 'converter' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
          }`}
        >
          Studio Converter
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          disabled={!hasDocument}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
            activeTab === 'preview' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
          } ${!hasDocument ? 'opacity-40 cursor-not-allowed hover:text-slate-600' : ''}`}
        >
          Live Document Inspector
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
            activeTab === 'batch' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
          }`}
        >
          Batch Processing
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
            activeTab === 'history' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
          }`}
        >
          Conversion Archive
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Conversion Configuration"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onNewUploadClick}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF Document</span>
        </button>
      </div>
    </header>
  );
};
