import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText, Loader2 } from 'lucide-react';

interface PdfViewerProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  fileName: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfDoc, fileName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.2);
  const [isRendering, setIsRendering] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [pageNum: number]: string }>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const numPages = pdfDoc.numPages;

  // Render current page
  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!canvasRef.current || !pdfDoc) return;

      setIsRendering(true);

      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancellation errors
        }
      }

      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: zoomScale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

        const renderContext = {
          canvas,
          canvasContext: context,
          transform: transform || undefined,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;

        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, zoomScale]);

  // Generate lightweight thumbnails for sidebar
  useEffect(() => {
    let isMounted = true;

    const generateThumbs = async () => {
      const generated: { [pageNum: number]: string } = {};

      for (let i = 1; i <= Math.min(numPages, 10); i++) {
        try {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvas, canvasContext: ctx, viewport }).promise;
            if (isMounted) {
              generated[i] = canvas.toDataURL('image/jpeg', 0.8);
              setThumbnails(prev => ({ ...prev, [i]: generated[i] }));
            }
          }
        } catch {
          // ignore thumb error
        }
      }
    };

    generateThumbs();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, numPages]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(p => p + 1);
  };

  const handleZoomIn = () => {
    setZoomScale(z => Math.min(2.5, Math.round((z + 0.2) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomScale(z => Math.max(0.6, Math.round((z - 0.2) * 10) / 10));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 font-mono tabular-nums">
            {numPages} {numPages === 1 ? 'Page' : 'Pages'}
          </span>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono tabular-nums text-slate-700 px-1">
            <span className="font-semibold text-slate-900">{currentPage}</span> / {numPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoomScale <= 0.6}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-1.5 py-0.5 font-mono tabular-nums text-slate-700 hover:bg-slate-100 rounded text-[11px] transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            {Math.round(zoomScale * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={zoomScale >= 2.5}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Thumbnails rail + Canvas viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnail sidebar if multi-page */}
        {numPages > 1 && (
          <div className="w-20 bg-slate-50 border-r border-slate-200 overflow-y-auto p-2 space-y-2 shrink-0">
            {Array.from({ length: numPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isSelected = pNum === currentPage;
              const thumbUrl = thumbnails[pNum];

              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-full text-center space-y-1 p-1 rounded transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-indigo-600 bg-white shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-full aspect-3/4 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={`Page ${pNum}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">{pNum}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-slate-600">p.{pNum}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Canvas Document Scroll Viewport */}
        <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-200/70">
          <div className="relative shadow-lg border border-slate-300 rounded-sm bg-white">
            {isRendering && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            )}
            <canvas ref={canvasRef} className="block" />
          </div>
        </div>
      </div>
    </div>
  );
};
