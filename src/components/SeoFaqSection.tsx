import React, { useState } from 'react';
import { ChevronDown, Shield, FileCheck, Table, Cpu, Lock } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Word & Document Conversion',
    question: 'How does KathirDocConverter convert PDF to Microsoft Word (.docx)?',
    answer: 'KathirDocConverter uses an advanced vector layout engine that analyzes PDF glyph streams, font baselines, and coordinate metrics. It synthesizes true OpenXML (ISO/IEC 29500-1) Word packages with authentic heading styles (H1–H3), paragraph margins, and formatted tables with cell borders.'
  },
  {
    category: 'Privacy & Security',
    question: 'Is KathirDocConverter safe for confidential legal and financial documents?',
    answer: 'Yes, 100%. Unlike standard online converters that upload your confidential files to remote servers, KathirDocConverter runs entirely inside your browser using WebAssembly. Your files never leave your device, ensuring total GDPR and compliance privacy.'
  },
  {
    category: 'Spreadsheets & Data Extraction',
    question: 'Can I extract financial and data tables from PDF into CSV or Excel?',
    answer: 'Yes. Our smart tabular alignment engine detects multi-column coordinate grids on each page and converts them into clean, structured CSV files ready for Microsoft Excel, Google Sheets, or Python/Pandas data pipelines.'
  },
  {
    category: 'Developer & Formats',
    question: 'Which file formats can I convert my PDF into?',
    answer: 'You can convert into Microsoft Word (.docx and .doc), Markdown (.md), HTML5 Web Document (.html), Plain Text (.txt), CSV Spreadsheets (.csv), Structured AST (.json), eBook Reader (.epub), and High-DPI Page Images (.zip).'
  },
  {
    category: 'Batch Processing',
    question: 'Can I convert multiple PDF files at once?',
    answer: 'Yes. The Batch Processing tab allows you to enqueue multiple PDF documents simultaneously, track real-time progress, and download converted files individually or as a single consolidated ZIP archive.'
  }
];

export const SeoFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-4xl mx-auto pt-10 border-t border-slate-200 space-y-8" aria-label="Frequently Asked Questions">
      {/* Editorial Title */}
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Frequently Asked Questions &amp; Technical Capabilities
        </h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Everything you need to know about high-fidelity PDF transformation, privacy guarantees, and output formats.
        </p>
      </div>

      {/* Trust & SEO Feature Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
            <Shield className="w-4 h-4" />
            <span>Zero-Server Upload Privacy</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All document synthesis runs client-side. Confidential contracts, statements, and tax forms stay on your device.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
            <FileCheck className="w-4 h-4" />
            <span>Authentic OpenXML Word</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exports compliant .docx packages with real Word paragraphs, headings, bullet lists, and zebra-striped tables.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
            <Table className="w-4 h-4" />
            <span>Smart Tabular Extraction</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Detects multi-column coordinates and converts financial tables directly into CSV spreadsheets for Excel.
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="transition-colors">
              <button
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer gap-4"
              >
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-indigo-600">{item.category}</span>
                  <h3 className="text-xs font-semibold text-slate-900">{item.question}</h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
