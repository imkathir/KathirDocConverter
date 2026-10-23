import React from 'react';
import { ConversionHistoryItem, TargetFormat } from '../types/converter';
import { Clock, FileText, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface HistoryDrawerProps {
  history: ConversionHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryDoc?: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onClearHistory,
  onSelectHistoryDoc
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Conversion Session Archive</h2>
          <p className="text-xs text-slate-500">
            Records of recently converted documents and exported targets in your current browser session.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Archive</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No conversions recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you convert a PDF into Word (.docx), Markdown, or spreadsheets, conversion details will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">Pages</th>
                  <th className="px-4 py-3 text-right">Size</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Exported Targets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate max-w-xs">{item.fileName}</span>
                    </td>

                    <td className="px-4 py-3 font-mono tabular-nums text-slate-600">
                      {item.pageCount} {item.pageCount === 1 ? 'Page' : 'Pages'}
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      {item.fileSizeFormatted}
                    </td>

                    <td className="px-4 py-3 font-mono tabular-nums text-slate-500">
                      {new Date(item.convertedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.downloadedFormats.length > 0 ? (
                          item.downloadedFormats.map((fmt, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded uppercase font-semibold"
                            >
                              .{fmt}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Converted</span>
                        )}
                      </div>
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
