import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const generatePdfFromHtml = async (report, fileName = 'resume_analysis_report.pdf') => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const margin = 40;
  let y = height - margin;

  const fontSize = 12;
  const headingFontSize = 16;
  const titleFontSize = 22;
  const bulletIndent = 20;

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const wrapText = (text, maxLineLength = 90) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length > maxLineLength) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    return lines;
  };

  const drawText = (text, options = {}) => {
    const {
      font = timesRomanFont,
      size = fontSize,
      color = rgb(0, 0, 0),
      x = margin,
      lineHeight = 1.5,
    } = options;

    const lines = wrapText(text, 90);
    for (const line of lines) {
      if (y < margin + 50) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      page.drawText(line, { x, y, size, font, color });
      y -= size * lineHeight;
    }
  };

  const drawSectionTitleBox = (text, color = rgb(0.2, 0.4, 0.8)) => {
    y -= 15;
    const boxHeight = 25;
    const textPadding = 8;
    page.drawRectangle({
      x: margin,
      y: y,
      width: width - 2 * margin,
      height: boxHeight,
      color: color,
    });
    page.drawText(text, {
      x: margin + textPadding,
      y: y + 7,
      size: headingFontSize,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    y -= boxHeight + 10;
  };

  const drawTopTitle = () => {
    page.drawText('AI Resume Analysis Report', {
      x: margin,
      y,
      size: titleFontSize,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.6),
    });
    y -= 25;

    const currentDate = new Date().toLocaleDateString();
    page.drawText(`Generated on: ${currentDate}`, {
      x: margin,
      y,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 20;
  };

  // === Draw content ===
  drawTopTitle();

  if (report.jobTitle) {
    drawSectionTitleBox('Job Title');
    drawText(report.jobTitle);
  }

  if (report.experienceLevel) {
    drawSectionTitleBox('Experience Level', rgb(0.3, 0.5, 0.9));
    drawText(report.experienceLevel);
  }

  
  if (report.jobDescription) {
    drawSectionTitleBox('Job Description', rgb(0.1, 0.6, 0.5));
    drawText(report.jobDescription);
  }

  if (report.llmAnalysis) {
    drawSectionTitleBox('AI Analysis Report', rgb(0.5, 0.3, 0.7));

    const lines = report.llmAnalysis.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.endsWith(':')) {
        y -= 10;
        drawText(trimmed, {
          font: boldFont,
          size: headingFontSize - 2,
          color: rgb(0.4, 0.2, 0.6),
        });
        y -= 6;
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        drawText('• ' + trimmed.slice(1).trim(), {
          x: margin + bulletIndent,
        });
      } else {
        drawText(trimmed);
      }
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  // === Save & Download ===
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, fileName);
};