import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
  AlignmentType,
  ShadingType
} from 'docx';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { ExtractedDocument, ConversionOptions, TargetFormat } from '../types/converter';
import { renderPageToCanvas } from './pdfEngine';

/**
 * Generate native Microsoft Word .docx using OpenXML docx engine
 */
export async function generateDocx(
  doc: ExtractedDocument,
  options: ConversionOptions
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  // Title / Header paragraph
  children.push(
    new Paragraph({
      text: doc.metadata.title || 'Converted Document',
      heading: HeadingLevel.TITLE,
      spacing: { after: 240, before: 120 }
    })
  );

  if (options.includeDocumentSummary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Source: ${doc.metadata.fileName} | Converted: ${new Date().toLocaleDateString()} | Total Pages: ${doc.metadata.pageCount}`,
            italics: true,
            size: 18, // 9pt
            color: '64748B'
          })
        ],
        spacing: { after: 360 }
      })
    );
  }

  // Iterate pages and blocks
  for (let pIdx = 0; pIdx < doc.pages.length; pIdx++) {
    const page = doc.pages[pIdx];

    if (options.preservePageBreaks && pIdx > 0) {
      children.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      );
    }

    for (const block of page.blocks) {
      if (block.type === 'heading1') {
        children.push(
          new Paragraph({
            text: block.content,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 120 }
          })
        );
      } else if (block.type === 'heading2') {
        children.push(
          new Paragraph({
            text: block.content,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 280, after: 100 }
          })
        );
      } else if (block.type === 'heading3') {
        children.push(
          new Paragraph({
            text: block.content,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 80 }
          })
        );
      } else if (block.type === 'bullet') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content.replace(/^[•\-\*]\s*/, ''),
                size: 22 // 11pt
              })
            ],
            bullet: { level: 0 },
            spacing: { before: 60, after: 60 }
          })
        );
      } else if (block.type === 'table' && block.tableData) {
        const { headers, rows } = block.tableData;

        // Build docx Table
        const tableRows: TableRow[] = [];

        // Header Row
        const headerCells = headers.map(h => {
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: h,
                    bold: true,
                    size: 20, // 10pt
                    color: '0F172A'
                  })
                ]
              })
            ],
            shading: {
              fill: 'E2E8F0',
              type: ShadingType.CLEAR
            },
            margins: { top: 120, bottom: 120, left: 160, right: 160 }
          });
        });

        tableRows.push(
          new TableRow({
            children: headerCells,
            tableHeader: true
          })
        );

        // Data Rows
        rows.forEach((row, rIdx) => {
          const cells = headers.map((_, colIdx) => {
            const cellVal = row[colIdx] || '';
            return new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cellVal,
                      size: 20, // 10pt
                      color: '1E293B'
                    })
                  ]
                })
              ],
              shading: rIdx % 2 === 1 ? { fill: 'F8FAFC', type: ShadingType.CLEAR } : undefined,
              margins: { top: 100, bottom: 100, left: 160, right: 160 }
            });
          });

          tableRows.push(
            new TableRow({
              children: cells
            })
          );
        });

        const docxTable = new Table({
          rows: tableRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          }
        });

        children.push(docxTable);
        // Add spacing after table
        children.push(new Paragraph({ spacing: { after: 200 } }));
      } else {
        // Standard Paragraph
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content,
                size: 22, // 11pt
                bold: block.isBold
              })
            ],
            spacing: { line: 276, before: 60, after: 120 }
          })
        );
      }
    }
  }

  const wordDocument = new Document({
    creator: doc.metadata.author || 'KathirDocConverter Suite',
    title: doc.metadata.title,
    description: doc.metadata.subject,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBlob(wordDocument);
}

/**
 * Generate legacy Microsoft Word .doc (Word MSO-compliant HTML envelope)
 * Native double-click opens in Word, LibreOffice, Apple Pages, Google Docs.
 */
export function generateDoc(doc: ExtractedDocument, options: ConversionOptions): Blob {
  const contentHtml = doc.fullHtml;

  const wordHtmlEnvelope = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeXml(doc.metadata.title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 { size:8.5in 11.0in; margin:1.0in 1.0in 1.0in 1.0in; mso-header-margin:.5in; mso-footer-margin:.5in; mso-paper-source:0; }
    div.Section1 { page:Section1; }
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.25; color: #1e293b; }
    h1 { font-size: 18pt; font-weight: bold; color: #0f172a; margin-top: 18pt; margin-bottom: 6pt; }
    h2 { font-size: 14pt; font-weight: bold; color: #1e293b; margin-top: 14pt; margin-bottom: 4pt; }
    h3 { font-size: 12pt; font-weight: bold; color: #334155; margin-top: 10pt; margin-bottom: 3pt; }
    p { margin-bottom: 8pt; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
    th { background-color: #e2e8f0; font-weight: bold; border: 1pt solid #cbd5e1; padding: 6pt; text-align: left; }
    td { border: 1pt solid #e2e8f0; padding: 5pt; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    .page-break { page-break-after: always; mso-special-character: line-break; }
  </style>
</head>
<body>
  <div class="Section1">
    ${contentHtml}
  </div>
</body>
</html>`;

  return new Blob([wordHtmlEnvelope], { type: 'application/msword' });
}

/**
 * Generate Markdown string
 */
export function generateMarkdown(doc: ExtractedDocument, options: ConversionOptions): string {
  return doc.fullMarkdown;
}

/**
 * Generate clean HTML5 string
 */
export function generateHtml(doc: ExtractedDocument, options: ConversionOptions): string {
  return doc.fullHtml;
}

/**
 * Generate plain text string
 */
export function generateText(doc: ExtractedDocument, options: ConversionOptions): string {
  return doc.fullText;
}

/**
 * Generate structured JSON string
 */
export function generateJson(doc: ExtractedDocument): string {
  return JSON.stringify(doc, null, 2);
}

/**
 * Generate CSV representation of all detected tables
 */
export function generateCsv(doc: ExtractedDocument, delimiter = ','): string {
  if (doc.tables.length === 0) {
    // Fallback: convert paragraphs into lines
    return doc.blocks.map(b => `"${b.content.replace(/"/g, '""')}"`).join('\n');
  }

  const sections: string[] = [];

  doc.tables.forEach((table, idx) => {
    const tableHeader = `# TABLE ${idx + 1}${table.title ? ': ' + table.title : ''} (Page ${table.pageNumber})`;
    const headerRow = table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(delimiter);
    const dataRows = table.rows.map(row => 
      table.headers.map((_, colIdx) => {
        const val = row[colIdx] || '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(delimiter)
    ).join('\n');

    sections.push(`${tableHeader}\n${headerRow}\n${dataRows}`);
  });

  return sections.join('\n\n');
}

/**
 * Generate standard EPUB package
 */
export async function generateEpub(doc: ExtractedDocument): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype (must be uncompressed first entry)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // 3. OEBPS/toc.ncx
  zip.file(
    'OEBPS/toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:kathirdocconverter-${Date.now()}"/>
  </head>
  <docTitle><text>${escapeXml(doc.metadata.title)}</text></docTitle>
  <navMap>
    <navPoint id="navpoint-1" playOrder="1">
      <navLabel><text>Document Content</text></navLabel>
      <content src="chapter1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`
  );

  // 4. OEBPS/chapter1.xhtml
  zip.file(
    'OEBPS/chapter1.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${escapeXml(doc.metadata.title)}</title>
  <style>
    body { font-family: serif; line-height: 1.5; padding: 5%; color: #111; }
    h1 { font-size: 1.8em; margin-bottom: 0.5em; }
    h2 { font-size: 1.4em; margin-top: 1em; }
    p { margin-bottom: 0.8em; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
  </style>
</head>
<body>
  <h1>${escapeXml(doc.metadata.title)}</h1>
  ${doc.pages.map(p => `<div>${p.blocks.map(b => `<p>${escapeXml(b.content)}</p>`).join('')}</div>`).join('<hr/>')}
</body>
</html>`
  );

  // 5. OEBPS/content.opf
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(doc.metadata.title)}</dc:title>
    <dc:creator>${escapeXml(doc.metadata.author || 'KathirDocConverter')}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookID">urn:uuid:kathirdocconverter-${Date.now()}</dc:identifier>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.[0-9]+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
  </spine>
</package>`
  );

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}

/**
 * Render all pages to high-DPI images and bundle into a ZIP
 */
export async function generatePageImagesZip(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  format: 'png' | 'jpg' = 'png',
  scale = 2.0,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const numPages = pdfDoc.numPages;

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);
    const canvas = await renderPageToCanvas(pdfDoc, i, scale);

    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => {
          if (b) resolve(b);
          else reject(new Error(`Failed to render canvas for page ${i}`));
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        0.95
      );
    });

    const pageStr = String(i).padStart(3, '0');
    zip.file(`page_${pageStr}.${format}`, imageBlob);
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generate Master Archive containing all supported conversion formats
 */
export async function generateAllBundleZip(
  doc: ExtractedDocument,
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  options: ConversionOptions,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const baseName = doc.metadata.fileName.replace(/\.[^/.]+$/, '');

  onProgress?.(10, 'Compiling Microsoft Word (.docx)...');
  const docxBlob = await generateDocx(doc, options);
  zip.file(`${baseName}.docx`, docxBlob);

  onProgress?.(25, 'Generating Word Legacy Document (.doc)...');
  const docBlob = generateDoc(doc, options);
  zip.file(`${baseName}.doc`, docBlob);

  onProgress?.(40, 'Generating Markdown (.md)...');
  const mdContent = generateMarkdown(doc, options);
  zip.file(`${baseName}.md`, mdContent);

  onProgress?.(55, 'Generating HTML5 Web Document (.html)...');
  const htmlContent = generateHtml(doc, options);
  zip.file(`${baseName}.html`, htmlContent);

  onProgress?.(65, 'Generating Plain Text (.txt)...');
  const txtContent = generateText(doc, options);
  zip.file(`${baseName}.txt`, txtContent);

  onProgress?.(75, 'Generating Structured JSON (.json)...');
  const jsonContent = generateJson(doc);
  zip.file(`${baseName}.json`, jsonContent);

  if (doc.tables.length > 0) {
    onProgress?.(85, 'Generating Extracted Tables (.csv)...');
    const csvContent = generateCsv(doc, options.tableExportDelimiter);
    zip.file(`${baseName}_tables.csv`, csvContent);
  }

  onProgress?.(90, 'Generating EPUB eBook (.epub)...');
  const epubBlob = await generateEpub(doc);
  zip.file(`${baseName}.epub`, epubBlob);

  onProgress?.(95, 'Bundling all formats into archive...');
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Triggers browser download of a Blob
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
