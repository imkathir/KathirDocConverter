import React, { useState } from 'react';
import {
  ExtractedDocument,
  ConversionOptions,
  ExtractedTable,
  ExtractedBlock
} from '../types/converter';
import {
  FileText,
  Code2,
  Table as TableIcon,
  FileCode,
  Edit3,
  Copy,
  Check,
  Download,
  Search,
  Maximize2
} from 'lucide-react';
import { downloadBlob } from '../services/exportEngine';

interface ConvertedPreviewProps {
  extractedDoc: ExtractedDocument;
  onUpdateDoc: (updatedDoc: ExtractedDocument) => void;
  options: ConversionOptions;
}

export const ConvertedPreview: React.FC<ConvertedPreviewProps> = ({
  extractedDoc,
  onUpdateDoc,
  options
}) => {
  const [activeTab, setActiveTab] = useState<'word' | 'editor' | 'markdown' | 'html' | 'tables' | 'json'>('word');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);

  const handleCopy = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleBlockContentChange = (blockId: string, newContent: string) => {
    const updatedBlocks = extractedDoc.blocks.map(b =>
      b.id === blockId ? { ...b, content: newContent } : b
    );

    const updatedPages = extractedDoc.pages.map(p => ({
      ...p,
      blocks: p.blocks.map(b => (b.id === blockId ? { ...b, content: newContent } : b)),
      text: p.blocks.map(b => (b.id === blockId ? newContent : b.content)).join('\n\n')
    }));

    const updatedFullText = updatedPages.map(p => `--- PAGE ${p.pageNumber} ---\n\n${p.text}`).join('\n\n');

    onUpdateDoc({
      ...extractedDoc,
      blocks: updatedBlocks,
      pages: updatedPages,
      fullText: updatedFullText
    });
  };

  const exportSingleTableToCsv = (table: ExtractedTable) => {
    const headerRow = table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
    const dataRows = table.rows.map(r =>
      table.headers.map((_, colIdx) => `"${(r[colIdx] || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const csvData = `${headerRow}\n${dataRows}`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    downloadBlob(blob, `table_page_${table.pageNumber}.csv`);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Tab Navigation & Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('word')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'word'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Word Page Preview
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Content Editor
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Markdown (MD)
          </button>

          <button
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'html'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HTML5 Code
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Extracted Tables ({extractedDoc.tables.length})
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AST JSON
          </button>
        </div>

        {/* Copy action */}
        <div className="flex items-center gap-2">
          {activeTab === 'markdown' && (
            <button
              onClick={() => handleCopy(extractedDoc.fullMarkdown, 'md')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              {copiedTab === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'md' ? 'Copied' : 'Copy MD'}</span>
            </button>
          )}

          {activeTab === 'html' && (
            <button
              onClick={() => handleCopy(extractedDoc.fullHtml, 'html')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              {copiedTab === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'html' ? 'Copied' : 'Copy HTML'}</span>
            </button>
          )}

          {activeTab === 'json' && (
            <button
              onClick={() => handleCopy(JSON.stringify(extractedDoc, null, 2), 'json')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              {copiedTab === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'json' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-auto p-6 bg-slate-100/60">
        {/* Tab 1: Word Page Preview */}
        {activeTab === 'word' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {extractedDoc.pages.map((page) => (
              <div
                key={page.pageNumber}
                className="bg-white border border-slate-300 rounded-sm shadow-md p-10 min-h-[750px] space-y-4"
              >
                {/* Word Page Header / Meta */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-2 mb-4 font-mono">
                  <span>{extractedDoc.metadata.title}</span>
                  <span className="tabular-nums">Page {page.pageNumber} of {extractedDoc.metadata.pageCount}</span>
                </div>

                {page.blocks.map((block) => {
                  if (block.type === 'heading1') {
                    return (
                      <h1
                        key={block.id}
                        className="text-xl font-bold text-slate-900 tracking-tight pt-3 pb-1 border-b border-slate-200"
                      >
                        {block.content}
                      </h1>
                    );
                  }
                  if (block.type === 'heading2') {
                    return (
                      <h2 key={block.id} className="text-base font-semibold text-slate-900 pt-2 pb-0.5">
                        {block.content}
                      </h2>
                    );
                  }
                  if (block.type === 'heading3') {
                    return (
                      <h3 key={block.id} className="text-sm font-semibold text-slate-800 pt-1">
                        {block.content}
                      </h3>
                    );
                  }
                  if (block.type === 'bullet') {
                    return (
                      <div key={block.id} className="flex items-start gap-2 text-xs text-slate-700 pl-2">
                        <span className="text-slate-400 mt-1">·</span>
                        <span>{block.content.replace(/^[•\-\*]\s*/, '')}</span>
                      </div>
                    );
                  }
                  if (block.type === 'table' && block.tableData) {
                    const { headers, rows } = block.tableData;
                    return (
                      <div key={block.id} className="my-4 overflow-x-auto border border-slate-200 rounded-md">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                            <tr>
                              {headers.map((h, hi) => (
                                <th key={hi} className="px-3 py-2 border-r border-slate-200 last:border-r-0">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rows.map((row, ri) => (
                              <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                                {headers.map((_, ci) => (
                                  <td
                                    key={ci}
                                    className="px-3 py-2 text-slate-700 border-r border-slate-100 last:border-r-0 font-mono text-[11px]"
                                  >
                                    {row[ci] || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  return (
                    <p key={block.id} className="text-xs text-slate-700 leading-relaxed">
                      {block.content}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Live Content Editor */}
        {activeTab === 'editor' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-center justify-between">
              <span>
                Edit any extracted block or header below. Your edits immediately propagate into your final DOCX, DOC, Markdown, and HTML exports!
              </span>
            </div>

            <div className="space-y-4 bg-white p-6 border border-slate-200 rounded-xl shadow-xs">
              {extractedDoc.blocks.map((block) => (
                <div key={block.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="capitalize">{block.type} · Page {block.pageNumber}</span>
                  </div>

                  {block.type === 'heading1' || block.type === 'heading2' || block.type === 'heading3' ? (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-semibold text-slate-900 border border-slate-300 rounded-md focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                  ) : block.type === 'table' ? (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600">
                      [Structured Table with {block.tableData?.headers.length || 0} columns · Managed in Extracted Tables tab]
                    </div>
                  ) : (
                    <textarea
                      rows={Math.max(2, Math.ceil(block.content.length / 90))}
                      value={block.content}
                      onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-md focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none leading-relaxed"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Markdown */}
        {activeTab === 'markdown' && (
          <div className="max-w-3xl mx-auto">
            <pre className="p-6 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
              {extractedDoc.fullMarkdown}
            </pre>
          </div>
        )}

        {/* Tab 4: HTML */}
        {activeTab === 'html' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <pre className="p-6 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
              {extractedDoc.fullHtml}
            </pre>
          </div>
        )}

        {/* Tab 5: Extracted Tables */}
        {activeTab === 'tables' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {extractedDoc.tables.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 space-y-2">
                <TableIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-800">No Structured Tables Detected</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This document appears to be predominantly linear prose or paragraphs without multi-column grids.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Table selector if multiple */}
                {extractedDoc.tables.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {extractedDoc.tables.map((tbl, i) => (
                      <button
                        key={tbl.id}
                        onClick={() => setSelectedTableIndex(i)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                          selectedTableIndex === i
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Table {i + 1} (Page {tbl.pageNumber})
                      </button>
                    ))}
                  </div>
                )}

                {(() => {
                  const currentTable = extractedDoc.tables[selectedTableIndex] || extractedDoc.tables[0];
                  if (!currentTable) return null;

                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">
                            {currentTable.title || `Table on Page ${currentTable.pageNumber}`}
                          </h4>
                          <span className="text-xs text-slate-500 font-mono tabular-nums">
                            {currentTable.headers.length} Columns · {currentTable.rows.length} Rows
                          </span>
                        </div>

                        <button
                          onClick={() => exportSingleTableToCsv(currentTable)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export Table as CSV</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              {currentTable.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2.5 border-r border-slate-200 last:border-r-0">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentTable.rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                                {currentTable.headers.map((_, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="px-3 py-2 text-slate-700 border-r border-slate-100 last:border-r-0 font-mono tabular-nums text-[11px]"
                                  >
                                    {row[colIdx] || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: JSON AST */}
        {activeTab === 'json' && (
          <div className="max-w-3xl mx-auto">
            <pre className="p-6 bg-slate-900 text-sky-300 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
              {JSON.stringify(extractedDoc, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
