/**
 * pdfExport.ts — genera archivos PDF detallados a partir del DOM.
 *
 * Captura uno o varios elementos de la página con html2canvas y los compone en
 * un PDF A4 (jsPDF) con encabezado (empresa, sección, fecha), paginación
 * automática del contenido alto y pie de página con numeración.
 *
 * El objetivo es que el PDF sea fiel a lo que se ve en pantalla, pero limpio y
 * entendible: portada de encabezado por página y numeración.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfMeta {
  /** Empresa / caso (encabezado izquierdo). */
  company: string;
  /** Título general del estudio (subtítulo del encabezado). */
  documentTitle: string;
}

export interface ExportOptions extends PdfMeta {
  /** Título de la sección o página que se está exportando. */
  sectionTitle: string;
  /** Descripción breve de la sección (1-3 líneas) para dar contexto. */
  description?: string;
  /** Nombre del archivo sin extensión. Si se omite se genera uno. */
  fileName?: string;
}

/* --------------------------------- Colores -------------------------------- */
const PRIMARY: [number, number, number] = [47, 95, 208]; // --primary #2f5fd0
const INK: [number, number, number] = [30, 41, 59];
const SOFT: [number, number, number] = [120, 132, 150];

/* ----------------------------- Layout (en pt) ----------------------------- */
const MARGIN = 40;
const BAND_H = 46; // banda azul superior
const TITLE_GAP = 22; // baseline del título de sección respecto a la banda
const FOOTER_H = 26;

/**
 * Exporta un elemento del DOM a un PDF con encabezado y paginación.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    // No captura los controles marcados como ocultos para PDF (botones, etc.).
    ignoreElements: (el) => el.classList?.contains('pdf-hide') ?? false,
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const contentW = pageW - MARGIN * 2;

  // Descripción opcional: se calcula cuántas líneas ocupa para reservar espacio.
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  const descLines = options.description
    ? pdf.splitTextToSize(options.description, contentW)
    : [];
  const descHeight = descLines.length * 12;

  // El contenido empieza tras el título, la descripción y una línea divisoria.
  const contentTop = BAND_H + TITLE_GAP + 8 + descHeight + 14;
  const contentBottom = pageH - FOOTER_H;
  const contentH = contentBottom - contentTop;

  // Relación px(canvas) -> pt(pdf) manteniendo el ancho de contenido.
  const ratio = contentW / canvas.width;
  const pageContentPx = Math.floor(contentH / ratio); // px de canvas por página
  const totalPages = Math.max(1, Math.ceil(canvas.height / pageContentPx));

  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let renderedPx = 0;
  let pageIndex = 0;

  while (renderedPx < canvas.height) {
    if (pageIndex > 0) pdf.addPage();

    drawHeader(pdf, pageW, options, dateStr, descLines, contentTop);

    const sliceHeightPx = Math.min(pageContentPx, canvas.height - renderedPx);

    // Recorte del trozo correspondiente a esta página en un canvas temporal.
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceHeightPx;
    const ctx = slice.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(
        canvas,
        0,
        renderedPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );
    }

    const imgData = slice.toDataURL('image/png');
    const sliceHeightPt = sliceHeightPx * ratio;
    pdf.addImage(imgData, 'PNG', MARGIN, contentTop, contentW, sliceHeightPt);

    drawFooter(pdf, pageW, pageH, pageIndex + 1, totalPages, options.company);

    renderedPx += sliceHeightPx;
    pageIndex += 1;
  }

  pdf.save(`${buildFileName(options)}.pdf`);
}

/* -------------------------------------------------------------------------- */
/* Encabezado y pie                                                           */
/* -------------------------------------------------------------------------- */
function drawHeader(
  pdf: jsPDF,
  pageW: number,
  options: ExportOptions,
  dateStr: string,
  descLines: string[],
  contentTop: number
): void {
  // Banda superior.
  pdf.setFillColor(...PRIMARY);
  pdf.rect(0, 0, pageW, BAND_H, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`Investigación de Operaciones · ${options.company}`, MARGIN, 22);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(options.documentTitle, MARGIN, 36);
  pdf.text(dateStr, pageW - MARGIN, 22, { align: 'right' });

  // Título de la sección bajo la banda.
  pdf.setTextColor(...PRIMARY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text(options.sectionTitle, MARGIN, BAND_H + TITLE_GAP);

  // Descripción breve (contexto de la sección).
  if (descLines.length) {
    pdf.setTextColor(...SOFT);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(descLines, MARGIN, BAND_H + TITLE_GAP + 16);
  }

  // Línea divisoria justo antes del contenido.
  pdf.setDrawColor(...PRIMARY);
  pdf.setLineWidth(0.8);
  pdf.line(MARGIN, contentTop - 8, pageW - MARGIN, contentTop - 8);
}

function drawFooter(
  pdf: jsPDF,
  pageW: number,
  pageH: number,
  page: number,
  total: number,
  company: string
): void {
  pdf.setDrawColor(...SOFT);
  pdf.setLineWidth(0.4);
  pdf.line(MARGIN, pageH - FOOTER_H + 6, pageW - MARGIN, pageH - FOOTER_H + 6);

  pdf.setTextColor(...SOFT);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(company, MARGIN, pageH - 12);
  pdf.text(
    `Página ${page} de ${total}`,
    pageW / 2,
    pageH - 12,
    { align: 'center' }
  );
  pdf.setTextColor(...INK);
}

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                 */
/* -------------------------------------------------------------------------- */
function buildFileName(options: ExportOptions): string {
  if (options.fileName) return sanitize(options.fileName);
  const base = `${options.company}-${options.sectionTitle}`;
  const date = new Date().toISOString().slice(0, 10);
  return `${sanitize(base)}-${date}`;
}

function sanitize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
