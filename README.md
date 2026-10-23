# KathirDocConverter

> **High-Performance PDF & Multi-Format Document Conversion Suite**  
> Read, parse, inspect, edit, and convert PDF documents into Microsoft Word (`.docx`, `.doc`), Markdown (`.md`), HTML5 (`.html`), Spreadsheets (`.csv`), AST JSON (`.json`), Plain Text (`.txt`), eBooks (`.epub`), and High-DPI Page Images (`.zip`).

---

## Key Features

- **Genuine OpenXML Word Generation (`.docx`)**:
  - Reconstructs ISO/IEC 29500-1 compliant Microsoft Word files with styles, headers (H1–H3), margins, paragraphs, bullet lists, page breaks, and genuine Word tables with shaded headers and cell borders.
- **Legacy Word Compatibility (`.doc`)**:
  - Generates universal Word-compliant HTML/MIME documents (`application/msword`) that open seamlessly in older Word versions, LibreOffice, Apple Pages, and Google Docs.
- **Smart Table Grid Extraction (`.csv` & Word Tables)**:
  - Coordinate-aware spatial algorithms detect aligned tabular columns across pages and export them into delimited CSV files and structured Word tables.
- **Interactive Dual-Pane Inspector**:
  - **Left**: High-DPI canvas PDF viewer with zoom controls (60%–250%), page jumping (`tabular-nums`), and thumbnail navigation.
  - **Right**: Converted document inspector featuring Word page preview, live content editor, Markdown viewer, HTML viewer, and dedicated table grid inspector.
- **Live Document Editor**:
  - Edit extracted paragraphs and headings directly in the browser; all modifications automatically sync into your exported Word, Markdown, and HTML files.
- **Batch Processing Queue**:
  - Upload multiple PDF documents simultaneously, track progress with real-time indicators, and download individually or as a consolidated batch ZIP archive.
- **Zero-Server Data Confidentiality**:
  - 100% in-browser processing via WebAssembly and worker threads; confidential files and contracts never leave your local device.
- **Built-in Benchmark Samples**:
  - 1-click test documents including *Quarterly Financial & Revenue Report*, *Distributed Architecture Whitepaper*, and *Master Services Agreement Contract*.

---

## Supported Output Formats

| Format | Extension | Primary Use Case |
| :--- | :--- | :--- |
| **Microsoft Word** | `.docx` | Microsoft Word 2007–365, Google Docs, Apple Pages |
| **Legacy Word** | `.doc` | Universal Word processor compatibility |
| **Markdown** | `.md` | Obsidian, Notion, GitHub, Technical Documentation |
| **Semantic HTML5** | `.html` | Web publishing, email newsletters, responsive view |
| **Extracted Tables** | `.csv` | Microsoft Excel, Google Sheets, Pandas, Data Science |
| **Structured AST** | `.json` | Document intelligence pipelines, programmatic ingestion |
| **Plain Text** | `.txt` | Clean UTF-8 text with line break and paragraph normalization |
| **eBook Reader** | `.epub` | Apple Books, Kindle, Kobo, Calibre |
| **High-DPI Images** | `.zip` | PNG/JPG page renders (150–300 DPI) |
| **Master Archive** | `.zip` | All formats packaged together in a single archive |

---

## Quick Start & Local Development

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone repository
git clone <your-repo-url>
cd KathirDocConverter

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Build for Production
```bash
npm run build
```

---

## Tech Stack
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **PDF Engine**: Mozilla `pdfjs-dist` (Worker-accelerated vector & glyph parsing)
- **Document Generators**: `docx`, `pdf-lib`, `jszip`
- **Icons**: Lucide React
