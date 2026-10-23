import { FormatDefinition, ConversionOptions } from '../types/converter';

export const SUPPORTED_FORMATS: FormatDefinition[] = [
  {
    id: 'docx',
    name: 'Microsoft Word (DOCX)',
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'word',
    description: 'Modern OpenXML standard with headings, real Word tables, typography, and page breaks.',
    badge: 'Standard DOCX',
    recommendedFor: 'Microsoft Word 2007-365, Google Docs, Apple Pages'
  },
  {
    id: 'doc',
    name: 'Word Legacy Document (DOC)',
    extension: '.doc',
    mimeType: 'application/msword',
    category: 'word',
    description: 'Compatible Word document format formatted for legacy suites and universal word processors.',
    badge: 'Universal DOC',
    recommendedFor: 'Older MS Word versions, OpenOffice, LibreOffice'
  },
  {
    id: 'md',
    name: 'Markdown (MD)',
    extension: '.md',
    mimeType: 'text/markdown',
    category: 'document',
    description: 'Clean formatted markdown with auto-detected heading tags, bullet lists, and GFM tables.',
    badge: 'Dev & Docs',
    recommendedFor: 'Obsidian, Notion, GitHub, Technical Documentation'
  },
  {
    id: 'html',
    name: 'HTML5 Web Page',
    extension: '.html',
    mimeType: 'text/html',
    category: 'document',
    description: 'Self-contained semantic HTML page with embedded CSS, typography, and responsive styling.',
    badge: 'Semantic Web',
    recommendedFor: 'Web publishing, embedding, email newsletters'
  },
  {
    id: 'txt',
    name: 'Plain Text (TXT)',
    extension: '.txt',
    mimeType: 'text/plain',
    category: 'document',
    description: 'Pure UTF-8 extracted text with preserved paragraphs, normalized spacing, and clean encoding.',
    badge: 'Raw Text',
    recommendedFor: 'NLP analysis, LLM training, lightweight storage'
  },
  {
    id: 'json',
    name: 'Structured JSON (AST)',
    extension: '.json',
    mimeType: 'application/json',
    category: 'data',
    description: 'Machine-readable JSON containing metadata, page coordinates, block hierarchies, and table matrices.',
    badge: 'API & Data',
    recommendedFor: 'Data pipelines, backend ingestion, automated processing'
  },
  {
    id: 'csv',
    name: 'Extracted Tables (CSV)',
    extension: '.csv',
    mimeType: 'text/csv',
    category: 'data',
    description: 'Tabular data from the PDF parsed into delimited spreadsheet rows for financial and data analysis.',
    badge: 'Spreadsheet',
    recommendedFor: 'Microsoft Excel, Google Sheets, Pandas, R'
  },
  {
    id: 'epub',
    name: 'eBook Reader (EPUB)',
    extension: '.epub',
    mimeType: 'application/epub+zip',
    category: 'document',
    description: 'Packaged standard e-reader eBook with Table of Contents and reflowable pages.',
    badge: 'eReader',
    recommendedFor: 'Kindle, Apple Books, Kobo, Calibre'
  },
  {
    id: 'images',
    name: 'Page Images (PNG/JPG ZIP)',
    extension: '.zip',
    mimeType: 'application/zip',
    category: 'media',
    description: 'High-DPI canvas renderings of every PDF page bundled into an organized ZIP archive.',
    badge: 'Visual High-DPI',
    recommendedFor: 'Presentations, image archiving, OCR pipelines'
  }
];

export const DEFAULT_OPTIONS: ConversionOptions = {
  smartTableDetection: true,
  detectHeadings: true,
  preservePageBreaks: true,
  removeHyphenation: true,
  includeDocumentSummary: true,
  tableExportDelimiter: ',',
  imageExportFormat: 'png',
  imageScale: 2.0
};
