import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ExtractedDocument,
  ConversionOptions,
  TargetFormat,
  ConversionHistoryItem
} from './types/converter';
import { DEFAULT_OPTIONS } from './utils/constants';
import { SAMPLE_DOCUMENTS } from './utils/samplePdfs';
import { parsePdf } from './services/pdfEngine';
import {
  generateDocx,
  generateDoc,
  generateMarkdown,
  generateHtml,
  generateText,
  generateJson,
  generateCsv,
  generateEpub,
  generatePageImagesZip,
  generateAllBundleZip,
  downloadBlob
} from './services/exportEngine';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { PdfViewer } from './components/PdfViewer';
import { ConvertedPreview } from './components/ConvertedPreview';
import { FormatSelector } from './components/FormatSelector';
import { BatchQueue } from './components/BatchQueue';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SeoFaqSection } from './components/SeoFaqSection';
import {
  FileText,
  Columns,
  Maximize2,
  RefreshCw,
  Info,
  CheckCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';

const STORAGE_KEY_HISTORY = 'kathirdocconverter_conversion_history';

export default function App() {
  const [activeTab, setActiveTab] = useState<'converter' | 'preview' | 'batch' | 'history'>('converter');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocument | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<TargetFormat>('docx');
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [splitViewMode, setSplitViewMode] = useState(true);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const saveHistoryItem = (item: ConversionHistoryItem) => {
    setHistory(prev => {
      const updated = [item, ...prev.filter(i => i.id !== item.id)].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateHistoryDownload = (fileName: string, format: TargetFormat) => {
    setHistory(prev => {
      const updated = prev.map(item => {
        if (item.fileName === fileName) {
          const downloaded = item.downloadedFormats.includes(format)
            ? item.downloadedFormats
            : [...item.downloadedFormats, format];
          return { ...item, downloadedFormats: downloaded };
        }
        return item;
      });
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {}
  };

  const handleProcessFile = async (file: File) => {
    setIsLoading(true);
    setLoadingProgress(5);
    setLoadingStatus('Reading PDF byte stream...');
    setCurrentFile(file);

    try {
      const buffer = await file.arrayBuffer();
      const { extractedDoc: parsedDoc, pdfDoc: rawPdf } = await parsePdf(
        buffer,
        file.name,
        conversionOptions,
        (percent, status) => {
          setLoadingProgress(percent);
          setLoadingStatus(status);
        }
      );

      setExtractedDoc(parsedDoc);
      setPdfDoc(rawPdf);
      setActiveTab('converter');

      // Record in history
      saveHistoryItem({
        id: `hist-${Date.now()}`,
        fileName: file.name,
        fileSizeBytes: file.size,
        fileSizeFormatted: parsedDoc.metadata.fileSizeFormatted,
        pageCount: parsedDoc.metadata.pageCount,
        convertedAt: Date.now(),
        downloadedFormats: []
      });
    } catch (err: any) {
      console.error('Error parsing PDF:', err);
      alert(`Failed to parse PDF: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleSelect = async (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find(s => s.id === sampleId);
    if (!sample) return;

    setIsLoading(true);
    setLoadingProgress(10);
    setLoadingStatus(`Synthesizing ${sample.name}...`);

    try {
      const bytes = await sample.generate();
      const file = new File([bytes as unknown as BlobPart], `${sample.name}.pdf`, { type: 'application/pdf' });
      await handleProcessFile(file);
    } catch (err: any) {
      console.error('Error generating sample:', err);
      setIsLoading(false);
    }
  };

  const handleDownloadFormat = async (format: TargetFormat) => {
    if (!extractedDoc) return;
    setIsExporting(true);
    setExportStatus(`Compiling .${format}...`);

    const baseName = extractedDoc.metadata.fileName.replace(/\.[^/.]+$/, '');

    try {
      switch (format) {
        case 'docx': {
          const blob = await generateDocx(extractedDoc, conversionOptions);
          downloadBlob(blob, `${baseName}.docx`);
          break;
        }
        case 'doc': {
          const blob = generateDoc(extractedDoc, conversionOptions);
          downloadBlob(blob, `${baseName}.doc`);
          break;
        }
        case 'md': {
          const text = generateMarkdown(extractedDoc, conversionOptions);
          const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
          downloadBlob(blob, `${baseName}.md`);
          break;
        }
        case 'html': {
          const text = generateHtml(extractedDoc, conversionOptions);
          const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
          downloadBlob(blob, `${baseName}.html`);
          break;
        }
        case 'txt': {
          const text = generateText(extractedDoc, conversionOptions);
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          downloadBlob(blob, `${baseName}.txt`);
          break;
        }
        case 'json': {
          const text = generateJson(extractedDoc);
          const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
          downloadBlob(blob, `${baseName}.json`);
          break;
        }
        case 'csv': {
          const text = generateCsv(extractedDoc, conversionOptions.tableExportDelimiter);
          const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
          downloadBlob(blob, `${baseName}_tables.csv`);
          break;
        }
        case 'epub': {
          const blob = await generateEpub(extractedDoc);
          downloadBlob(blob, `${baseName}.epub`);
          break;
        }
        case 'images': {
          if (!pdfDoc) throw new Error('PDF stream not loaded');
          setExportStatus('Rendering pages at 200 DPI...');
          const blob = await generatePageImagesZip(
            pdfDoc,
            conversionOptions.imageExportFormat,
            conversionOptions.imageScale,
            (curr, total) => setExportStatus(`Rendering page ${curr}/${total}...`)
          );
          downloadBlob(blob, `${baseName}_pages.zip`);
          break;
        }
      }

      updateHistoryDownload(extractedDoc.metadata.fileName, format);
    } catch (err: any) {
      console.error('Download error:', err);
      alert(`Export error: ${err?.message || 'Could not generate file'}`);
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  const handleDownloadAllZip = async () => {
    if (!extractedDoc || !pdfDoc) return;
    setIsExporting(true);
    setExportStatus('Packaging all formats...');

    try {
      const blob = await generateAllBundleZip(
        extractedDoc,
        pdfDoc,
        conversionOptions,
        (pct, msg) => setExportStatus(msg)
      );
      const baseName = extractedDoc.metadata.fileName.replace(/\.[^/.]+$/, '');
      downloadBlob(blob, `${baseName}_all_formats.zip`);
      updateHistoryDownload(extractedDoc.metadata.fileName, 'docx');
    } catch (err: any) {
      console.error('Batch export error:', err);
      alert(`Archive export error: ${err?.message || 'Could not generate zip'}`);
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  const handleNewUploadClick = () => {
    setActiveTab('converter');
    setCurrentFile(null);
    setExtractedDoc(null);
    setPdfDoc(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewUploadClick={handleNewUploadClick}
        hasDocument={!!extractedDoc}
        onOpenSettings={() => setIsArchitectureModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* TAB 1: Studio Converter & Inspector */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            {!extractedDoc ? (
              <div className="py-6">
                <UploadDropzone
                  onFileSelect={handleProcessFile}
                  onSampleSelect={handleSampleSelect}
                  isLoading={isLoading}
                  loadingProgress={loadingProgress}
                  loadingStatus={loadingStatus}
                />
                <SeoFaqSection />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Document Header Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900 truncate max-w-md">
                          {extractedDoc.metadata.fileName}
                        </h2>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          {extractedDoc.metadata.fileSizeFormatted}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{extractedDoc.metadata.pageCount} Pages</span>
                        <span aria-hidden="true">·</span>
                        <span>{extractedDoc.blocks.length} Extracted Blocks</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{extractedDoc.tables.length} Tables Detected</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSplitViewMode(!splitViewMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        splitViewMode
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>{splitViewMode ? 'Side-by-Side View' : 'Single Pane View'}</span>
                    </button>

                    <button
                      onClick={handleNewUploadClick}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Change File
                    </button>
                  </div>
                </div>

                {/* Format Selector Component */}
                <FormatSelector
                  selectedFormat={selectedFormat}
                  onSelectFormat={setSelectedFormat}
                  onDownloadFormat={handleDownloadFormat}
                  onDownloadAllZip={handleDownloadAllZip}
                  options={conversionOptions}
                  onOptionsChange={setConversionOptions}
                  isExporting={isExporting}
                  exportStatus={exportStatus}
                />

                {/* Workspace Split View: Left PDF Canvas, Right Converted Word / Markdown Preview */}
                <div className={`grid gap-6 ${splitViewMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Left: Original PDF Canvas */}
                  {pdfDoc && (
                    <div className="h-[720px]">
                      <PdfViewer pdfDoc={pdfDoc} fileName={extractedDoc.metadata.fileName} />
                    </div>
                  )}

                  {/* Right: Live Converted Preview & Editor */}
                  <div className="h-[720px]">
                    <ConvertedPreview
                      extractedDoc={extractedDoc}
                      onUpdateDoc={setExtractedDoc}
                      options={conversionOptions}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Live Full Document Inspector */}
        {activeTab === 'preview' && extractedDoc && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Document Content & Table Inspector</h2>
                <p className="text-xs text-slate-500">
                  Inspect and edit extracted paragraphs, headers, and tabular structures before exporting.
                </p>
              </div>
            </div>
            <div className="h-[750px]">
              <ConvertedPreview
                extractedDoc={extractedDoc}
                onUpdateDoc={setExtractedDoc}
                options={conversionOptions}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Batch Queue */}
        {activeTab === 'batch' && (
          <BatchQueue options={conversionOptions} />
        )}

        {/* TAB 4: History Drawer */}
        {activeTab === 'history' && (
          <HistoryDrawer history={history} onClearHistory={clearHistory} />
        )}
      </main>

      {/* Footer conforming to design constitution: quiet copyright and architecture info */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span>KathirDocConverter Document Suite</span>
          <span aria-hidden="true">·</span>
          <span>Zero-Server Client Privacy</span>
          <span aria-hidden="true">·</span>
          <span>OpenXML ISO/IEC 29500-1 Compliant</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsArchitectureModalOpen(true)}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Architecture &amp; Engine Details</span>
          </button>
        </div>
      </footer>

      {/* Architecture Information Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
