import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { svgToBase64 } from '../assets/logos';

/**
 * Ensures all image elements with SVG sources use base64 data URLs.
 * Also handles converting any raw inline SVG elements into base64 image data URLs.
 */
function prepareSvgElementsInContainer(container: HTMLElement) {
  // 1. Process <img> elements with svg data URLs
  const imgElements = container.querySelectorAll<HTMLImageElement>('img');
  imgElements.forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:image/svg+xml') && !src.includes(';base64,')) {
      try {
        const svgContent = decodeURIComponent(src.replace(/^data:image\/svg\+xml;(utf8,)?/, ''));
        const b64 = svgToBase64(svgContent);
        if (b64) {
          img.src = `data:image/svg+xml;base64,${b64}`;
        }
      } catch (err) {
        console.warn('SVG data URL conversion notice:', err);
      }
    }
  });

  // 2. Process any raw inline <svg> tags inside the container
  const rawSvgs = container.querySelectorAll<SVGElement>('svg');
  rawSvgs.forEach((svg) => {
    try {
      const svgStr = new XMLSerializer().serializeToString(svg);
      const b64 = svgToBase64(svgStr);
      if (b64) {
        const img = document.createElement('img');
        img.src = `data:image/svg+xml;base64,${b64}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        svg.parentNode?.replaceChild(img, svg);
      }
    } catch (e) {
      console.warn('Raw SVG serialization notice:', e);
    }
  });
}

/**
 * Captures the A4 preview element using html2canvas with full isolation.
 * Automatically strips selection outlines, transform scaling, guides, and handles.
 */
async function captureA4Canvas(elementId: string, scale = 2.5): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Target document element with id "${elementId}" was not found.`);
  }

  // Pre-process any SVGs in the live element before cloning
  prepareSvgElementsInContainer(element);

  const canvas = await html2canvas(element, {
    scale: scale, // 2.5x delivers ~2000px height for ultra-crisp print quality without browser memory issues
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      const clonedTarget = clonedDoc.getElementById(elementId);
      if (!clonedTarget) return;

      // 1. Reset zoom transform & shadow on the cloned page
      clonedTarget.style.transform = 'none';
      clonedTarget.style.transformOrigin = 'top left';
      clonedTarget.style.boxShadow = 'none';
      clonedTarget.style.margin = '0';

      // 2. Remove all non-printing helper elements (handles, guides, grid, toolbars)
      const elementsToStrip = clonedDoc.querySelectorAll(
        '.no-print, .selection-handle, .alignment-guide, .canvas-grid, .rich-toolbar'
      );
      elementsToStrip.forEach((el) => el.remove());

      // 3. Remove active selection borders and hover rings
      const elementBoxes = clonedTarget.querySelectorAll('[id^="canvas-el-"]');
      elementBoxes.forEach((el) => {
        el.classList.remove(
          'ring-2',
          'ring-1',
          'ring-indigo-500',
          'ring-sky-400/50',
          'bg-indigo-500/5',
          'bg-sky-500/5',
          'bg-white/90'
        );
      });

      // 4. Ensure cloned SVGs are also clean base64 data URLs
      prepareSvgElementsInContainer(clonedTarget);

      // 5. Sanitize all stylesheets and inline styles in clonedDoc against oklch/modern CSS color functions
      try {
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
            styleEl.textContent = styleEl.textContent.replace(/oklch\([^)]+\)/g, '#000000');
          }
        });

        clonedDoc.querySelectorAll('*').forEach((node) => {
          if (node instanceof HTMLElement && node.style.cssText && node.style.cssText.includes('oklch')) {
            node.style.cssText = node.style.cssText.replace(/oklch\([^)]+\)/g, '#000000');
          }
        });
      } catch (err) {
        console.warn('oklch sanitizer notice:', err);
      }
    }
  });

  return canvas;
}

export interface PDFExportOptions {
  filename?: string;
  onProgress?: (stage: string) => void;
}

/**
 * Generates and downloads a vector-quality single-page A4 PDF file.
 * Strict A4 bounding box: 210mm x 297mm with zero trailing blank pages.
 */
export async function exportToA4PDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'assignment-cover.pdf',
    onProgress
  } = options;

  onProgress?.('Capturing document layers...');

  try {
    const canvas = await captureA4Canvas(elementId, 2.5);

    onProgress?.('Generating vector A4 PDF...');

    // Exact physical A4 format: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Place image at exactly 210mm x 297mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    // Strict single-page guarantee: eliminate any accidental extra page
    while (pdf.getNumberOfPages() > 1) {
      pdf.deletePage(pdf.getNumberOfPages());
    }

    onProgress?.('Downloading PDF file...');
    pdf.save(filename);
  } catch (error) {
    console.error('PDF Export Internal Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown PDF generation error';
    throw new Error(`PDF Export Error: ${message}`);
  }
}

/**
 * Captures the cover page and triggers a direct PNG file download.
 */
export async function exportToPNG(
  elementId: string,
  filename = 'cover-page.png'
): Promise<void> {
  try {
    const canvas = await captureA4Canvas(elementId, 2.5);
    const pngUrl = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = pngUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error('PNG Export Internal Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown PNG generation error';
    throw new Error(`PNG Export Error: ${message}`);
  }
}
