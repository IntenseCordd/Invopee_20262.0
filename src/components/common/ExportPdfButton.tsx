/**
 * ExportPdfButton.tsx — botón reutilizable para exportar a PDF un elemento del
 * DOM identificado por su `targetId`. Muestra estado de carga y usa la meta del
 * problema (empresa y título) para el encabezado del documento.
 */
import { useState } from 'react';
import { useProblem } from '../../state/ProblemContext';
import { exportElementToPdf } from '../../utils/pdfExport';

interface ExportPdfButtonProps {
  /** id del elemento del DOM que se capturará. */
  targetId: string;
  /** Título de la sección/página que aparecerá en el encabezado del PDF. */
  sectionTitle: string;
  /** Descripción breve para dar contexto en el PDF. */
  description?: string;
  /** Texto del botón. */
  label?: string;
  /** Estilo primario (relleno azul). */
  primary?: boolean;
  /** Empresa para el encabezado del PDF (si se omite, usa la del problema). */
  company?: string;
  /** Título del documento para el encabezado (si se omite, usa el del problema). */
  documentTitle?: string;
}

export function ExportPdfButton({
  targetId,
  sectionTitle,
  description,
  label = 'Exportar PDF',
  primary,
  company,
  documentTitle,
}: ExportPdfButtonProps) {
  const { data } = useProblem();
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    setBusy(true);
    try {
      await exportElementToPdf(element, {
        company: company ?? data.meta.company,
        documentTitle: documentTitle ?? data.meta.title,
        sectionTitle,
        description,
      });
    } catch (err) {
      console.error('No se pudo generar el PDF:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn${primary ? ' btn--primary' : ''} pdf-hide`}
      onClick={handleExport}
      disabled={busy}
      title="Generar un PDF detallado de esta sección"
    >
      {busy ? 'Generando…' : `↧ ${label}`}
    </button>
  );
}
