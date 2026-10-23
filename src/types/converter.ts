export type TargetFormat = 
  | 'docx' 
  | 'doc' 
  | 'txt' 
  | 'md' 
  | 'html' 
  | 'json' 
  | 'csv' 
  | 'epub' 
  | 'images';

export interface FormatDefinition {
  id: TargetFormat;
  name: string;
  extension: string;
  mimeType: string;
  category: 'word' | 'document' | 'data' | 'media';
  description: string;
  badge: string;
  recommendedFor: string;
}

export interface ExtractedBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'table' | 'divider';
  content: string;
  pageNumber: number;
  fontSize?: number;
  isBold?: boolean;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ExtractedTable {
  id: string;
  title?: string;
  pageNumber: number;
  headers: string[];
  rows: string[][];
}

export interface PageContent {
  pageNumber: number;
  text: string;
  blocks: ExtractedBlock[];
  tables: ExtractedTable[];
  width: number;
  height: number;
  canvasDataUrl?: string;
}

export interface DocumentMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
  pageCount: number;
  pdfVersion: string;
  fileSizeFormatted: string;
  fileName: string;
}

export interface ExtractedDocument {
  metadata: DocumentMetadata;
  pages: PageContent[];
  blocks: ExtractedBlock[];
  tables: ExtractedTable[];
  fullText: string;
  fullMarkdown: string;
  fullHtml: string;
}

export interface ConversionOptions {
  smartTableDetection: boolean;
  detectHeadings: boolean;
  preservePageBreaks: boolean;
  removeHyphenation: boolean;
  includeDocumentSummary: boolean;
  tableExportDelimiter: ',' | ';' | '\t';
  imageExportFormat: 'png' | 'jpg';
  imageScale: number;
}

export interface ConversionHistoryItem {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  pageCount: number;
  convertedAt: number;
  downloadedFormats: TargetFormat[];
}

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
  extractedDoc?: ExtractedDocument;
  rawPdfDoc?: any;
}
