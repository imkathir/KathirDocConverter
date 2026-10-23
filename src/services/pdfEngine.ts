import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ExtractedBlock,
  ExtractedDocument,
  ExtractedTable,
  PageContent,
  ConversionOptions
} from '../types/converter';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

interface RawTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  hasEOL: boolean;
}

interface TextLine {
  y: number;
  items: RawTextItem[];
  text: string;
  maxFontSize: number;
  isBold: boolean;
}

export async function parsePdf(
  fileData: ArrayBuffer | Uint8Array,
  fileName: string,
  options: ConversionOptions,
  onProgress?: (percent: number, status: string) => void
): Promise<{ extractedDoc: ExtractedDocument; pdfDoc: pdfjsLib.PDFDocumentProxy }> {
  onProgress?.(5, 'Loading PDF document stream...');

  const loadingTask = pdfjsLib.getDocument({
    data: fileData,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  onProgress?.(15, `Extracting metadata for ${numPages} page(s)...`);

  let docTitle = fileName.replace(/\.[^/.]+$/, '');
  let docAuthor = 'Unknown Author';
  let docSubject = '';
  let docKeywords = '';
  let docCreator = 'PDF Generator';
  let docProducer = 'PDF.js';
  let creationDate = new Date().toLocaleDateString();
  let modDate = new Date().toLocaleDateString();
  let pdfVersion = '1.7';

  try {
    const meta = await pdfDoc.getMetadata();
    if (meta?.info) {
      const info = meta.info as Record<string, any>;
      if (info.Title) docTitle = info.Title;
      if (info.Author) docAuthor = info.Author;
      if (info.Subject) docSubject = info.Subject;
      if (info.Keywords) docKeywords = info.Keywords;
      if (info.Creator) docCreator = info.Creator;
      if (info.Producer) docProducer = info.Producer;
      if (info.CreationDate) creationDate = String(info.CreationDate);
      if (info.ModDate) modDate = String(info.ModDate);
    }
  } catch {
    // Graceful fallback if metadata is unparseable
  }

  const pages: PageContent[] = [];
  const allBlocks: ExtractedBlock[] = [];
  const allTables: ExtractedTable[] = [];

  // Pass 1: gather all font sizes across document to compute statistical body font size
  const fontSizesSample: number[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progressPercent = Math.round(15 + (pageNum / numPages) * 35);
    onProgress?.(progressPercent, `Analyzing typography page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
        const h = Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || 10;
        fontSizesSample.push(Math.round(h * 10) / 10);
      }
    }
  }

  // Calculate modal font size (body text font size)
  const fontCountMap: Record<number, number> = {};
  for (const size of fontSizesSample) {
    fontCountMap[size] = (fontCountMap[size] || 0) + 1;
  }

  let modalFontSize = 10;
  let maxCount = 0;
  for (const [sizeStr, count] of Object.entries(fontCountMap)) {
    if (count > maxCount) {
      maxCount = count;
      modalFontSize = parseFloat(sizeStr);
    }
  }
  if (modalFontSize <= 4) modalFontSize = 10;

  // Pass 2: Extract structured text, lines, tables, and blocks per page
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progressPercent = Math.round(50 + (pageNum / numPages) * 40);
    onProgress?.(progressPercent, `Synthesizing structures on page ${pageNum}...`);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    const rawItems: RawTextItem[] = [];

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const str = item.str;
      if (!str && !item.hasEOL) continue;

      const tx = item.transform[4];
      const ty = item.transform[5];
      const fontSize = Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || modalFontSize;
      const fontName = item.fontName || '';
      const isBold = fontName.toLowerCase().includes('bold') || fontName.toLowerCase().includes('black') || fontName.toLowerCase().includes('heavy');

      rawItems.push({
        str,
        x: tx,
        y: ty,
        width: item.width,
        height: item.height || fontSize,
        fontSize,
        fontName,
        hasEOL: !!item.hasEOL
      });
    }

    // Cluster items into lines by matching Y coordinates (PDF origin is bottom-left, ty is distance from bottom)
    const lines: TextLine[] = [];
    const yTolerance = 3.5;

    // Sort items by Y descending (top to bottom), then X ascending (left to right)
    rawItems.sort((a, b) => {
      if (Math.abs(b.y - a.y) > yTolerance) {
        return b.y - a.y; // Higher Y comes first
      }
      return a.x - b.x; // Left to right
    });

    for (const item of rawItems) {
      let matchedLine = lines.find(line => Math.abs(line.y - item.y) <= yTolerance);
      if (!matchedLine) {
        matchedLine = {
          y: item.y,
          items: [],
          text: '',
          maxFontSize: item.fontSize,
          isBold: item.fontName.toLowerCase().includes('bold')
        };
        lines.push(matchedLine);
      }
      matchedLine.items.push(item);
      if (item.fontSize > matchedLine.maxFontSize) {
        matchedLine.maxFontSize = item.fontSize;
      }
      if (item.fontName.toLowerCase().includes('bold')) {
        matchedLine.isBold = true;
      }
    }

    // Sort lines from top to bottom of the page
    lines.sort((a, b) => b.y - a.y);

    // Build unified text for each line
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);
      let lineStr = '';
      for (let i = 0; i < line.items.length; i++) {
        const it = line.items[i];
        if (i > 0) {
          const prev = line.items[i - 1];
          const gap = it.x - (prev.x + prev.width);
          // If spacing gap is greater than small threshold and neither starts/ends with space
          if (gap > 2 && !lineStr.endsWith(' ') && !it.str.startsWith(' ')) {
            lineStr += ' ';
          }
        }
        lineStr += it.str;
      }
      line.text = lineStr.trim();
    }

    // Filter empty lines
    const activeLines = lines.filter(l => l.text.length > 0);

    // Detect tables and blocks
    const pageBlocks: ExtractedBlock[] = [];
    const pageTables: ExtractedTable[] = [];

    let lineIndex = 0;
    while (lineIndex < activeLines.length) {
      const currentLine = activeLines[lineIndex];

      // Check if current line + subsequent lines form a table
      let tableDetected = false;
      if (options.smartTableDetection && currentLine.items.length >= 2) {
        const potentialTableLines: TextLine[] = [currentLine];
        let nextIdx = lineIndex + 1;

        while (nextIdx < activeLines.length && potentialTableLines.length < 30) {
          const nextLine = activeLines[nextIdx];
          // Check if lines are relatively close vertically (within 35px) and have multiple items
          const lineGap = Math.abs(potentialTableLines[potentialTableLines.length - 1].y - nextLine.y);
          if (lineGap < 38 && nextLine.items.length >= 2) {
            potentialTableLines.push(nextLine);
            nextIdx++;
          } else {
            break;
          }
        }

        // A table has at least 2 rows with 2+ columns
        if (potentialTableLines.length >= 2) {
          // Verify column alignment or delimiter
          const tableHeaders = potentialTableLines[0].items.map(it => it.str.trim()).filter(s => s.length > 0);
          if (tableHeaders.length >= 2) {
            const tableRows: string[][] = [];
            for (let r = 1; r < potentialTableLines.length; r++) {
              const rowItems = potentialTableLines[r].items;
              // Map items into columns based on closest header X
              const rowData: string[] = [];
              for (const headerItem of potentialTableLines[0].items) {
                // Find row item closest to this header's X position
                const match = rowItems.find(it => Math.abs(it.x - headerItem.x) < 65);
                rowData.push(match ? match.str.trim() : '');
              }
              // If empty, fallback to simple items map
              if (rowData.every(c => c === '')) {
                tableRows.push(rowItems.map(it => it.str.trim()));
              } else {
                tableRows.push(rowData);
              }
            }

            const tableId = `tbl-p${pageNum}-${lineIndex}`;
            const extTable: ExtractedTable = {
              id: tableId,
              title: currentLine.text.startsWith('Table') ? currentLine.text : undefined,
              pageNumber: pageNum,
              headers: tableHeaders,
              rows: tableRows
            };

            pageTables.push(extTable);
            allTables.push(extTable);

            pageBlocks.push({
              id: `block-${tableId}`,
              type: 'table',
              content: `[Table: ${tableHeaders.join(' | ')}]`,
              pageNumber: pageNum,
              tableData: {
                headers: tableHeaders,
                rows: tableRows
              }
            });

            tableDetected = true;
            lineIndex = nextIdx;
          }
        }
      }

      if (!tableDetected) {
        const text = currentLine.text;
        const fontSize = currentLine.maxFontSize;
        const isBold = currentLine.isBold;

        // Classify Block
        let blockType: ExtractedBlock['type'] = 'paragraph';

        if (options.detectHeadings) {
          if (fontSize >= modalFontSize * 1.45 || (fontSize >= modalFontSize * 1.3 && isBold && text.length < 90)) {
            blockType = 'heading1';
          } else if (fontSize >= modalFontSize * 1.2 || (isBold && text.length < 80 && !text.endsWith('.'))) {
            blockType = 'heading2';
          } else if (fontSize > modalFontSize * 1.05 && isBold && text.length < 90) {
            blockType = 'heading3';
          }
        }

        if (blockType === 'paragraph') {
          if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*') || /^\d+\.\s/.test(text)) {
            blockType = 'bullet';
          }
        }

        // Check if next lines should be merged into this paragraph
        let fullBlockContent = text;
        if (blockType === 'paragraph' && !text.endsWith('.')) {
          let lookaheadIdx = lineIndex + 1;
          while (lookaheadIdx < activeLines.length) {
            const nextL = activeLines[lookaheadIdx];
            const gapY = Math.abs(activeLines[lookaheadIdx - 1].y - nextL.y);

            // If same font size, reasonable line spacing, and not heading or bullet
            if (
              gapY < 24 &&
              Math.abs(nextL.maxFontSize - modalFontSize) <= 1.5 &&
              !nextL.text.startsWith('•') &&
              !nextL.text.startsWith('-') &&
              !/^\d+\.\s/.test(nextL.text) &&
              !(nextL.maxFontSize >= modalFontSize * 1.25)
            ) {
              if (options.removeHyphenation && fullBlockContent.endsWith('-')) {
                fullBlockContent = fullBlockContent.slice(0, -1) + nextL.text;
              } else {
                fullBlockContent += ' ' + nextL.text;
              }
              lineIndex = lookaheadIdx;
              lookaheadIdx++;
            } else {
              break;
            }
          }
        }

        pageBlocks.push({
          id: `block-p${pageNum}-${lineIndex}`,
          type: blockType,
          content: fullBlockContent,
          pageNumber: pageNum,
          fontSize,
          isBold
        });

        lineIndex++;
      }
    }

    const pageText = pageBlocks.map(b => b.content).join('\n\n');

    pages.push({
      pageNumber: pageNum,
      text: pageText,
      blocks: pageBlocks,
      tables: pageTables,
      width: viewport.width,
      height: viewport.height
    });

    allBlocks.push(...pageBlocks);
  }

  onProgress?.(95, 'Synthesizing final full documents...');

  // Build fullText, fullMarkdown, fullHtml
  const fullText = pages.map(p => `--- PAGE ${p.pageNumber} ---\n\n${p.text}`).join('\n\n');

  const mdSections: string[] = [];
  for (const page of pages) {
    if (options.preservePageBreaks && page.pageNumber > 1) {
      mdSections.push(`\n\n---\n*Page ${page.pageNumber}*\n\n`);
    }

    for (const block of page.blocks) {
      if (block.type === 'heading1') {
        mdSections.push(`\n# ${block.content}\n`);
      } else if (block.type === 'heading2') {
        mdSections.push(`\n## ${block.content}\n`);
      } else if (block.type === 'heading3') {
        mdSections.push(`\n### ${block.content}\n`);
      } else if (block.type === 'bullet') {
        mdSections.push(`- ${block.content.replace(/^[•\-\*]\s*/, '')}`);
      } else if (block.type === 'table' && block.tableData) {
        const { headers, rows } = block.tableData;
        const headerRow = `| ${headers.join(' | ')} |`;
        const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`;
        const dataRows = rows.map(r => `| ${r.join(' | ')} |`).join('\n');
        mdSections.push(`\n${headerRow}\n${dividerRow}\n${dataRows}\n`);
      } else {
        mdSections.push(`\n${block.content}\n`);
      }
    }
  }

  const fullMarkdown = mdSections.join('\n').trim();

  // Full HTML
  const htmlBodyParts: string[] = [];
  for (const page of pages) {
    htmlBodyParts.push(`<section class="pdf-page" data-page="${page.pageNumber}">`);
    if (page.pageNumber > 1 && options.preservePageBreaks) {
      htmlBodyParts.push(`<div class="page-break-divider"><span>Page ${page.pageNumber}</span></div>`);
    }

    for (const b of page.blocks) {
      if (b.type === 'heading1') {
        htmlBodyParts.push(`<h1>${escapeHtml(b.content)}</h1>`);
      } else if (b.type === 'heading2') {
        htmlBodyParts.push(`<h2>${escapeHtml(b.content)}</h2>`);
      } else if (b.type === 'heading3') {
        htmlBodyParts.push(`<h3>${escapeHtml(b.content)}</h3>`);
      } else if (b.type === 'bullet') {
        htmlBodyParts.push(`<ul><li>${escapeHtml(b.content.replace(/^[•\-\*]\s*/, ''))}</li></ul>`);
      } else if (b.type === 'table' && b.tableData) {
        const { headers, rows } = b.tableData;
        let tblHtml = `<div class="table-container"><table><thead><tr>`;
        headers.forEach(h => {
          tblHtml += `<th>${escapeHtml(h)}</th>`;
        });
        tblHtml += `</tr></thead><tbody>`;
        rows.forEach(r => {
          tblHtml += `<tr>`;
          r.forEach(c => {
            tblHtml += `<td>${escapeHtml(c)}</td>`;
          });
          tblHtml += `</tr>`;
        });
        tblHtml += `</tbody></table></div>`;
        htmlBodyParts.push(tblHtml);
      } else {
        htmlBodyParts.push(`<p>${escapeHtml(b.content)}</p>`);
      }
    }
    htmlBodyParts.push(`</section>`);
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(docTitle)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 820px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 2.2rem; font-weight: 700; color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    h2 { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-top: 1.4em; margin-bottom: 0.4em; }
    h3 { font-size: 1.2rem; font-weight: 600; color: #334155; margin-top: 1.2em; margin-bottom: 0.3em; }
    p { margin-bottom: 1.1em; }
    ul { margin-bottom: 1.1em; padding-left: 1.8em; }
    li { margin-bottom: 0.4em; }
    .table-container { overflow-x: auto; margin: 1.5em 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
    th { background: #f8fafc; font-weight: 600; text-align: left; padding: 10px 14px; border: 1px solid #cbd5e1; }
    td { padding: 9px 14px; border: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    .page-break-divider { border-top: 2px dashed #cbd5e1; margin: 3rem 0 2rem; text-align: center; }
    .page-break-divider span { background: #fff; padding: 0 1rem; color: #64748b; font-size: 0.85rem; font-weight: 500; position: relative; top: -0.7em; }
  </style>
</head>
<body>
  ${htmlBodyParts.join('\n')}
</body>
</html>`;

  const fileSize = fileData instanceof ArrayBuffer ? fileData.byteLength : fileData.length;
  const fileSizeFormatted = formatBytes(fileSize);

  onProgress?.(100, 'Conversion parsing complete!');

  return {
    extractedDoc: {
      metadata: {
        title: docTitle,
        author: docAuthor,
        subject: docSubject,
        keywords: docKeywords,
        creator: docCreator,
        producer: docProducer,
        creationDate,
        modDate,
        pageCount: numPages,
        pdfVersion,
        fileSizeFormatted,
        fileName
      },
      pages,
      blocks: allBlocks,
      tables: allTables,
      fullText,
      fullMarkdown,
      fullHtml
    },
    pdfDoc
  };
}

export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 1.5
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d')!;

  const renderContext = {
    canvas,
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  return canvas;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
