import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface SampleDocConfig {
  id: string;
  name: string;
  description: string;
  pagesCount: number;
  generate: () => Promise<Uint8Array>;
}

export const SAMPLE_DOCUMENTS: SampleDocConfig[] = [
  {
    id: 'financial-report',
    name: 'Quarterly Financial & Revenue Report',
    description: 'Corporate earnings document featuring financial statement tables, KPIs, and segment growth.',
    pagesCount: 2,
    generate: async () => {
      const pdfDoc = await PDFDocument.create();
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Page 1
      const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page1.getSize();

      // Header
      page1.drawText('ACME HOLDINGS CORP', {
        x: 50,
        y: height - 60,
        size: 10,
        font: helveticaBold,
        color: rgb(0.3, 0.35, 0.45)
      });
      page1.drawText('Q3 2026 FINANCIAL AND OPERATING PERFORMANCE', {
        x: 50,
        y: height - 90,
        size: 18,
        font: timesRomanBold,
        color: rgb(0.1, 0.12, 0.18)
      });
      page1.drawText('Published October 2026 · Investor Relations & Capital Markets Group', {
        x: 50,
        y: height - 110,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.45, 0.5)
      });

      // Section 1
      page1.drawText('1. Executive Overview & Consolidated Results', {
        x: 50,
        y: height - 145,
        size: 13,
        font: timesRomanBold,
        color: rgb(0.12, 0.15, 0.2)
      });

      const body1 = 
        'During the third quarter of fiscal 2026, Acme Holdings delivered consolidated net revenue of $148.6 million, ' +
        'representing a 24.2% year-over-year increase compared to $119.6 million reported in Q3 2025. ' +
        'Operating margin expanded 320 basis points to 28.4%, driven by operational efficiency, recurring software subscription momentum, ' +
        'and disciplined cost management across regional centers in North America and Western Europe.';
      
      page1.drawText(body1, {
        x: 50,
        y: height - 165,
        size: 10,
        font: timesRoman,
        lineHeight: 14,
        maxWidth: width - 100,
        color: rgb(0.2, 0.22, 0.25)
      });

      // Table 1: Financial Performance Matrix
      page1.drawText('Table 1.1: Consolidated Financial Performance (USD in Millions)', {
        x: 50,
        y: height - 235,
        size: 11,
        font: helveticaBold,
        color: rgb(0.15, 0.18, 0.25)
      });

      // Table lines & headers
      const tableTop = height - 255;
      const rowHeight = 22;
      const colX = [50, 200, 290, 380, 470];

      // Header row
      page1.drawRectangle({
        x: 50,
        y: tableTop - 16,
        width: width - 100,
        height: 22,
        color: rgb(0.92, 0.94, 0.97)
      });

      page1.drawText('Metric Category', { x: colX[0] + 5, y: tableTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('Q3 2025', { x: colX[1] + 5, y: tableTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('Q2 2026', { x: colX[2] + 5, y: tableTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('Q3 2026', { x: colX[3] + 5, y: tableTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('YoY Change', { x: colX[4] + 5, y: tableTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });

      const tableData = [
        ['Enterprise Platform Subscriptions', '$74.2M', '$88.1M', '$98.5M', '+32.7%'],
        ['Professional Implementation Services', '$28.4M', '$29.0M', '$31.2M', '+9.8%'],
        ['Maintenance & Managed Infrastructure', '$17.0M', '$18.2M', '$18.9M', '+11.2%'],
        ['Total Consolidated Net Revenue', '$119.6M', '$135.3M', '$148.6M', '+24.2%'],
        ['Gross Profit Margin', '68.4%', '70.2%', '72.1%', '+370 bps'],
        ['Adjusted Operating Cash Flow', '$32.1M', '$38.4M', '$44.8M', '+39.5%']
      ];

      tableData.forEach((row, rowIndex) => {
        const yPos = tableTop - 16 - ((rowIndex + 1) * rowHeight);
        if (rowIndex % 2 === 1) {
          page1.drawRectangle({
            x: 50,
            y: yPos,
            width: width - 100,
            height: rowHeight,
            color: rgb(0.97, 0.98, 0.99)
          });
        }
        row.forEach((cell, cellIdx) => {
          page1.drawText(cell, {
            x: colX[cellIdx] + 5,
            y: yPos + 5,
            size: 8.5,
            font: rowIndex === 3 ? helveticaBold : helvetica,
            color: rgb(0.15, 0.18, 0.22)
          });
        });
      });

      // Section 2
      const sec2Y = tableTop - 16 - (7 * rowHeight) - 30;
      page1.drawText('2. Strategic Initiatives & Infrastructure Growth', {
        x: 50,
        y: sec2Y,
        size: 13,
        font: timesRomanBold,
        color: rgb(0.12, 0.15, 0.2)
      });

      const body2 =
        '• Global Cloud Migration: 94% of enterprise customer instances have been successfully migrated to high-availability multi-region clusters.\n' +
        '• Research & Development: Allocated $22.4 million into distributed document intelligence and cryptographic document provenance pipelines.\n' +
        '• Customer Retention: Net Revenue Retention (NRR) reached 128%, reflecting low churn and substantial expansion across Fortune 500 accounts.';

      page1.drawText(body2, {
        x: 50,
        y: sec2Y - 20,
        size: 9.5,
        font: timesRoman,
        lineHeight: 16,
        maxWidth: width - 100,
        color: rgb(0.2, 0.22, 0.25)
      });

      // Page 2
      const page2 = pdfDoc.addPage([595.28, 841.89]);
      page2.drawText('3. Segment Revenue Breakdown by Geography', {
        x: 50,
        y: height - 60,
        size: 13,
        font: timesRomanBold,
        color: rgb(0.12, 0.15, 0.2)
      });

      page2.drawText('Table 2.1: Regional Geographic Distribution', {
        x: 50,
        y: height - 85,
        size: 11,
        font: helveticaBold,
        color: rgb(0.15, 0.18, 0.25)
      });

      const geoTop = height - 105;
      page2.drawRectangle({
        x: 50,
        y: geoTop - 16,
        width: width - 100,
        height: 22,
        color: rgb(0.92, 0.94, 0.97)
      });

      const geoCols = [50, 180, 270, 360, 460];
      page2.drawText('Operating Region', { x: geoCols[0] + 5, y: geoTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page2.drawText('Active Clients', { x: geoCols[1] + 5, y: geoTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page2.drawText('Revenue ($M)', { x: geoCols[2] + 5, y: geoTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page2.drawText('Contribution %', { x: geoCols[3] + 5, y: geoTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page2.drawText('Annual Run Rate', { x: geoCols[4] + 5, y: geoTop - 11, size: 9, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });

      const geoData = [
        ['North America (US & Canada)', '1,240', '$89.2M', '60.0%', '$356.8M'],
        ['Europe, Middle East, Africa', '620', '$38.6M', '26.0%', '$154.4M'],
        ['Asia-Pacific & Japan', '340', '$16.4M', '11.0%', '$65.6M'],
        ['Latin America', '110', '$4.4M', '3.0%', '$17.6M'],
        ['Global Consolidated', '2,310', '$148.6M', '100.0%', '$594.4M']
      ];

      geoData.forEach((row, rowIndex) => {
        const yPos = geoTop - 16 - ((rowIndex + 1) * rowHeight);
        if (rowIndex % 2 === 1) {
          page2.drawRectangle({
            x: 50,
            y: yPos,
            width: width - 100,
            height: rowHeight,
            color: rgb(0.97, 0.98, 0.99)
          });
        }
        row.forEach((cell, cellIdx) => {
          page2.drawText(cell, {
            x: geoCols[cellIdx] + 5,
            y: yPos + 5,
            size: 8.5,
            font: rowIndex === 4 ? helveticaBold : helvetica,
            color: rgb(0.15, 0.18, 0.22)
          });
        });
      });

      page2.drawText('4. Audit Statement & Forward-Looking Outlook', {
        x: 50,
        y: height - 280,
        size: 13,
        font: timesRomanBold,
        color: rgb(0.12, 0.15, 0.2)
      });

      const auditText = 
        'The financial statements contained herein have been reviewed in accordance with GAAP standards by an independent audit committee. ' +
        'Management reiterates its full-year revenue guidance between $580M and $605M with non-GAAP operating margin targets of 29-31%.\n\n' +
        'Approved by Board of Directors:\n' +
        'Chief Executive Officer: Marcus Vance, MBA\n' +
        'Chief Financial Officer: Elena Rostova, CPA';

      page2.drawText(auditText, {
        x: 50,
        y: height - 305,
        size: 9.5,
        font: timesRoman,
        lineHeight: 16,
        maxWidth: width - 100,
        color: rgb(0.2, 0.22, 0.25)
      });

      return await pdfDoc.save();
    }
  },
  {
    id: 'engineering-whitepaper',
    name: 'Distributed Architecture Whitepaper',
    description: 'Technical whitepaper with architectural specifications, throughput tables, and protocols.',
    pagesCount: 2,
    generate: async () => {
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      const page1 = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page1.getSize();

      page1.drawText('TECHNICAL SPECIFICATION RFC-8840', {
        x: 50,
        y: height - 55,
        size: 9,
        font: helveticaBold,
        color: rgb(0.35, 0.4, 0.5)
      });

      page1.drawText('Zero-Copy Document Transformation & Stream Parsing', {
        x: 50,
        y: height - 80,
        size: 17,
        font: helveticaBold,
        color: rgb(0.08, 0.1, 0.15)
      });

      page1.drawText('Authors: Dr. Alistair Chen, Principal Systems Architect · Distributed Systems Lab', {
        x: 50,
        y: height - 100,
        size: 9,
        font: helvetica,
        color: rgb(0.35, 0.4, 0.45)
      });

      page1.drawText('Abstract', {
        x: 50,
        y: height - 130,
        size: 12,
        font: helveticaBold,
        color: rgb(0.12, 0.15, 0.2)
      });

      const abstract =
        'This specification outlines the architecture of an asynchronous, memory-bounded document transformation pipeline ' +
        'capable of converting arbitrary Portable Document Format (PDF) bitstreams into typed semantic AST representations. ' +
        'By utilizing WebAssembly-compiled lexical scanners and streaming OpenXML generators, the system eliminates traditional ' +
        'server-side bottleneck queues while preserving typographic hierarchy, tabular geometry, and multi-encoding font maps.';

      page1.drawText(abstract, {
        x: 50,
        y: height - 150,
        size: 9.5,
        font: timesRoman,
        lineHeight: 15,
        maxWidth: width - 100,
        color: rgb(0.2, 0.22, 0.25)
      });

      page1.drawText('Table 1: Benchmark Throughput Across Target Encodings', {
        x: 50,
        y: height - 230,
        size: 10,
        font: helveticaBold,
        color: rgb(0.15, 0.18, 0.25)
      });

      const bCols = [50, 150, 240, 340, 440];
      const bTop = height - 250;
      const rowHeight = 22;

      page1.drawRectangle({
        x: 50,
        y: bTop - 16,
        width: width - 100,
        height: 22,
        color: rgb(0.9, 0.93, 0.96)
      });

      page1.drawText('Engine Stage', { x: bCols[0] + 5, y: bTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('Latency (P50)', { x: bCols[1] + 5, y: bTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('Latency (P99)', { x: bCols[2] + 5, y: bTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('Memory Allocated', { x: bCols[3] + 5, y: bTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText('Output Format', { x: bCols[4] + 5, y: bTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });

      const benchData = [
        ['Lexical Tokenizer', '1.2 ms', '3.8 ms', '14.2 MB', 'Tokens Stream'],
        ['Spatial Column Resolver', '2.4 ms', '5.1 ms', '18.6 MB', 'Matrix Grid'],
        ['OpenXML Synthesizer', '4.8 ms', '9.2 ms', '22.0 MB', 'DOCX Package'],
        ['Markdown Serializer', '0.6 ms', '1.4 ms', '4.1 MB', 'CommonMark MD'],
        ['JSON AST Export', '0.8 ms', '1.9 ms', '6.5 MB', 'JSON Schema v4']
      ];

      benchData.forEach((row, rowIndex) => {
        const yPos = bTop - 16 - ((rowIndex + 1) * rowHeight);
        row.forEach((cell, cellIdx) => {
          page1.drawText(cell, {
            x: bCols[cellIdx] + 5,
            y: yPos + 5,
            size: 8.5,
            font: helvetica,
            color: rgb(0.2, 0.22, 0.25)
          });
        });
      });

      // Section
      const secY = bTop - 16 - (6 * rowHeight) - 25;
      page1.drawText('2. Coordinate-Aware Paragraph Synthesis', {
        x: 50,
        y: secY,
        size: 12,
        font: helveticaBold,
        color: rgb(0.12, 0.15, 0.2)
      });

      const bodySec = 
        'Traditional PDF readers emit raw textual glyphs stripped of structural meaning. ' +
        'Our algorithm computes font-metric clusters along the Y-axis to identify baseline bounds, ' +
        'automatically classifying headers based on statistical variance from the modal body size. ' +
        'Inline hyphens occurring before an end-of-line marker are unified with following glyph runs.';

      page1.drawText(bodySec, {
        x: 50,
        y: secY - 20,
        size: 9.5,
        font: timesRoman,
        lineHeight: 15,
        maxWidth: width - 100,
        color: rgb(0.2, 0.22, 0.25)
      });

      // Page 2
      const page2 = pdfDoc.addPage([595.28, 841.89]);
      page2.drawText('3. OpenXML Document Specification Architecture', {
        x: 50,
        y: height - 60,
        size: 13,
        font: helveticaBold,
        color: rgb(0.1, 0.12, 0.18)
      });

      const p2Body = 
        'The output document generates compliant ISO/IEC 29500-1:2016 packages. ' +
        'Standard structures include:\n\n' +
        '1. [Content_Types].xml defining relationship schemas and MIME mappings.\n' +
        '2. word/document.xml with full w:body, w:p, w:r, and w:tbl element trees.\n' +
        '3. word/styles.xml supplying predefined Title, Subtitle, Heading1, and Normal styles.\n' +
        '4. docProps/core.xml encapsulating dc:title, dc:creator, and dcterms:created timestamps.';

      page2.drawText(p2Body, {
        x: 50,
        y: height - 85,
        size: 9.5,
        font: timesRoman,
        lineHeight: 16,
        maxWidth: width - 100,
        color: rgb(0.2, 0.22, 0.25)
      });

      return await pdfDoc.save();
    }
  },
  {
    id: 'legal-contract',
    name: 'Master Services Agreement (Contract)',
    description: 'B2B legal contract with recitals, numbered clauses, and SLA terms table.',
    pagesCount: 1,
    generate: async () => {
      const pdfDoc = await PDFDocument.create();
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      page.drawText('MASTER SERVICES AGREEMENT', {
        x: 50,
        y: height - 60,
        size: 16,
        font: timesRomanBold,
        color: rgb(0.1, 0.1, 0.15)
      });

      page.drawText('Contract Reference: MSA-2026-ENG-4491 · Effective Date: October 1, 2026', {
        x: 50,
        y: height - 80,
        size: 9,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.45)
      });

      const legalIntro = 
        'This Master Services Agreement ("Agreement") is made between CloudScale Solutions Inc. ("Provider") ' +
        'and Enterprise Global Logistics LLC ("Client"). Provider and Client hereby agree as follows:\n\n' +
        '1. SCOPE OF SERVICES: Provider shall furnish high-throughput document processing engines, conversion gateways, and data verification toolkits.\n\n' +
        '2. SERVICE LEVEL AGREEMENT (SLA): Provider agrees to the operational uptime commitments and target resolution times enumerated below:';

      page.drawText(legalIntro, {
        x: 50,
        y: height - 110,
        size: 9.5,
        font: timesRoman,
        lineHeight: 15,
        maxWidth: width - 100,
        color: rgb(0.2, 0.2, 0.2)
      });

      // SLA Table
      const slaTop = height - 210;
      const cols = [50, 160, 270, 380, 480];
      const rowH = 22;

      page.drawRectangle({
        x: 50,
        y: slaTop - 16,
        width: width - 100,
        height: 22,
        color: rgb(0.93, 0.94, 0.96)
      });

      page.drawText('Severity Tier', { x: cols[0] + 5, y: slaTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.15) });
      page.drawText('Description', { x: cols[1] + 5, y: slaTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.15) });
      page.drawText('Target Response', { x: cols[2] + 5, y: slaTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.15) });
      page.drawText('Monthly Uptime', { x: cols[3] + 5, y: slaTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.15) });
      page.drawText('Service Credit', { x: cols[4] + 5, y: slaTop - 11, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.15) });

      const slaRows = [
        ['Priority 1 (Critical)', 'Full conversion outage', '< 15 Minutes', '99.95%', '10% Billing'],
        ['Priority 2 (High)', 'Degraded batch throughput', '< 60 Minutes', '99.90%', '5% Billing'],
        ['Priority 3 (Medium)', 'Isolated rendering issue', '< 4 Hours', '99.50%', '2% Billing'],
        ['Priority 4 (Low)', 'General inquiry & feature', '< 24 Hours', '99.00%', '0% Billing']
      ];

      slaRows.forEach((row, i) => {
        const y = slaTop - 16 - ((i + 1) * rowH);
        row.forEach((cell, ci) => {
          page.drawText(cell, {
            x: cols[ci] + 5,
            y: y + 5,
            size: 8.5,
            font: timesRoman,
            color: rgb(0.2, 0.2, 0.2)
          });
        });
      });

      const legalEnding = 
        '3. CONFIDENTIALITY: Each party agrees to hold all proprietary files and converted outputs in strict confidence.\n\n' +
        '4. GOVERNING LAW: This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.\n\n' +
        'IN WITNESS WHEREOF, the authorized representatives have executed this Agreement:\n\n' +
        'For Provider: Arthur Vance, VP Engineering          For Client: Sarah Jenkins, General Counsel';

      page.drawText(legalEnding, {
        x: 50,
        y: slaTop - 16 - (5 * rowH) - 20,
        size: 9.5,
        font: timesRoman,
        lineHeight: 16,
        maxWidth: width - 100,
        color: rgb(0.2, 0.2, 0.2)
      });

      return await pdfDoc.save();
    }
  }
];
