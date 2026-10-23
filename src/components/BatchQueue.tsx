import React, { useState, useRef } from 'react';
import { BatchItem, TargetFormat, ConversionOptions } from '../types/converter';
import { parsePdf } from '../services/pdfEngine';
import { generateDocx, generateDoc, generateMarkdown, generateHtml, generateText, generateJson, generateCsv, generateAllBundleZip, downloadBlob } from '../services/exportEngine';
import { SUPPORTED_FORMATS } from '../utils/constants';
import { SAMPLE_DOCUMENTS } from '../utils/samplePdfs';
import { Upload, Play, CheckCircle2, AlertCircle, Loader2, Download, Trash2, FileText, Archive } from 'lucide-react';
import JSZip from 'jszip';

interface BatchQueueProps {
  options: ConversionOptions;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({ options }) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [batchTargetFormat, setBatchTargetFormat] = useState<TargetFormat>('docx');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        newItems.push({
          id: `batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          file,
          name: file.name,
          size: file.size,
          status: 'pending',
          progress: 0
        });
      }
    }

    setItems(prev => [...prev, ...newItems]);
  };

  const handleLoadSampleBatch = async () => {
    const newItems: BatchItem[] = [];

    for (const sample of SAMPLE_DOCUMENTS) {
      const bytes = await sample.generate();
      const file = new File([bytes as unknown as BlobPart], `${sample.id}.pdf`, { type: 'application/pdf' });
      newItems.push({
        id: `batch-sample-${sample.id}`,
        file,
        name: `${sample.name}.pdf`,
        size: bytes.byteLength,
        status: 'pending',
        progress: 0
      });
    }

    setItems(prev => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const processSingleItem = async (item: BatchItem): Promise<{ doc: any; rawPdf: any }> => {
    setItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'processing', progress: 10 } : it));

    const buffer = await item.file.arrayBuffer();
    const { extractedDoc, pdfDoc } = await parsePdf(
      buffer,
      item.name,
      options,
      (percent) => {
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, progress: percent } : it));
      }
    );

    setItems(prev => prev.map(it => it.id === item.id ? {
      ...it,
      status: 'done',
      progress: 100,
      extractedDoc,
      rawPdfDoc: pdfDoc
    } : it));

    return { doc: extractedDoc, rawPdf: pdfDoc };
  };

  const processAll = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);

    for (const item of items) {
      if (item.status !== 'done') {
        try {
          await processSingleItem(item);
        } catch (err: any) {
          setItems(prev => prev.map(it => it.id === item.id ? {
            ...it,
            status: 'error',
            errorMessage: err?.message || 'Processing failed'
          } : it));
        }
      }
    }

    setIsProcessingAll(false);
  };

  const downloadSingleConverted = async (item: BatchItem) => {
    if (!item.extractedDoc) return;
    const baseName = item.name.replace(/\.[^/.]+$/, '');

    switch (batchTargetFormat) {
      case 'docx': {
        const blob = await generateDocx(item.extractedDoc, options);
        downloadBlob(blob, `${baseName}.docx`);
        break;
      }
      case 'doc': {
        const blob = generateDoc(item.extractedDoc, options);
        downloadBlob(blob, `${baseName}.doc`);
        break;
      }
      case 'md': {
        const text = generateMarkdown(item.extractedDoc, options);
        downloadBlob(new Blob([text], { type: 'text/markdown' }), `${baseName}.md`);
        break;
      }
      case 'html': {
        const text = generateHtml(item.extractedDoc, options);
        downloadBlob(new Blob([text], { type: 'text/html' }), `${baseName}.html`);
        break;
      }
      case 'csv': {
        const text = generateCsv(item.extractedDoc, options.tableExportDelimiter);
        downloadBlob(new Blob([text], { type: 'text/csv' }), `${baseName}.csv`);
        break;
      }
      case 'txt': {
        const text = generateText(item.extractedDoc, options);
        downloadBlob(new Blob([text], { type: 'text/plain' }), `${baseName}.txt`);
        break;
      }
      case 'json': {
        const text = generateJson(item.extractedDoc);
        downloadBlob(new Blob([text], { type: 'application/json' }), `${baseName}.json`);
        break;
      }
    }
  };

  const downloadAllBatchZip = async () => {
    const doneItems = items.filter(it => it.status === 'done' && it.extractedDoc);
    if (doneItems.length === 0) return;

    const zip = new JSZip();

    for (const item of doneItems) {
      const doc = item.extractedDoc!;
      const baseName = item.name.replace(/\.[^/.]+$/, '');

      if (batchTargetFormat === 'docx') {
        const blob = await generateDocx(doc, options);
        zip.file(`${baseName}.docx`, blob);
      } else if (batchTargetFormat === 'doc') {
        const blob = generateDoc(doc, options);
        zip.file(`${baseName}.doc`, blob);
      } else if (batchTargetFormat === 'md') {
        zip.file(`${baseName}.md`, generateMarkdown(doc, options));
      } else if (batchTargetFormat === 'html') {
        zip.file(`${baseName}.html`, generateHtml(doc, options));
      } else if (batchTargetFormat === 'csv') {
        zip.file(`${baseName}.csv`, generateCsv(doc, options.tableExportDelimiter));
      } else if (batchTargetFormat === 'txt') {
        zip.file(`${baseName}.txt`, generateText(doc, options));
      } else if (batchTargetFormat === 'json') {
        zip.file(`${baseName}.json`, generateJson(doc));
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `batch_converted_${batchTargetFormat}.zip`);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Batch Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Batch Document Conversion Queue</h2>
          <p className="text-xs text-slate-500">
            Enqueue multiple PDF files and convert them in parallel into Word, Markdown, or spreadsheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Batch Target:</span>
            <select
              value={batchTargetFormat}
              onChange={(e) => setBatchTargetFormat(e.target.value as TargetFormat)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              {SUPPORTED_FORMATS.filter(f => f.id !== 'images' && f.id !== 'epub').map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add PDF Files</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            onChange={(e) => handleFilesAdded(e.target.files)}
            className="hidden"
          />

          <button
            onClick={processAll}
            disabled={items.length === 0 || isProcessingAll}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            {isProcessingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Queue...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Convert All ({items.length})</span>
              </>
            )}
          </button>

          {items.some(i => i.status === 'done') && (
            <button
              onClick={downloadAllBatchZip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Download Batch .ZIP</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear Queue"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      {items.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Your conversion queue is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Select multiple PDF files to batch-convert to DOCX, DOC, Markdown, or spreadsheets in parallel.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              Browse PDF Documents
            </button>
            <button
              onClick={handleLoadSampleBatch}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Load Benchmark Batch (3 Files)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3 text-right">File Size</th>
                  <th className="px-4 py-3">Conversion Status</th>
                  <th className="px-4 py-3 text-center">Pages</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      {formatSize(item.size)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1 max-w-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium capitalize text-slate-700">
                            {item.status}
                          </span>
                          <span className="font-mono tabular-nums text-slate-500">
                            {item.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 transition-all duration-200 ${
                              item.status === 'done'
                                ? 'bg-emerald-500'
                                : item.status === 'error'
                                ? 'bg-rose-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center font-mono tabular-nums text-slate-600">
                      {item.extractedDoc?.metadata.pageCount || '—'}
                    </td>

                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      {item.status === 'done' ? (
                        <button
                          onClick={() => downloadSingleConverted(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                        >
                          Download {batchTargetFormat.toUpperCase()}
                        </button>
                      ) : (
                        <button
                          onClick={() => processSingleItem(item)}
                          disabled={item.status === 'processing'}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-40"
                        >
                          Convert
                        </button>
                      )}

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
