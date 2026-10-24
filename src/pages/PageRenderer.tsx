/**
 * PageRenderer.tsx — renderiza, apiladas, todas las secciones de una página.
 * Cada sección se envuelve en un ancla (id) para poder desplazarse desde el menú
 * y ofrece un botón para exportar esa sección a PDF. Además, expone un botón
 * global para exportar la página completa.
 */
import { PAGES, SECTIONS, type PageId } from '../sections';
import { ExportPdfButton } from '../components/common/ExportPdfButton';

interface PageRendererProps {
  page: PageId;
  /** Empresa y título para el encabezado de los PDF de esta página. */
  exportMeta?: { company: string; documentTitle: string };
}

export function PageRenderer({ page, exportMeta }: PageRendererProps) {
  const sections = SECTIONS.filter((s) => s.page === page);
  const pageLabel = PAGES.find((p) => p.id === page)?.label ?? 'Documento';
  const pageRootId = `page-root-${page}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="export-bar export-bar--page pdf-hide">
        <span className="export-bar__hint">
          Exporta esta página completa o cada sección por separado en PDF.
        </span>
        <ExportPdfButton
          targetId={pageRootId}
          sectionTitle={pageLabel}
          description={`Documento completo de la sección “${pageLabel}” con todos sus análisis.`}
          label="Exportar página (PDF)"
          company={exportMeta?.company}
          documentTitle={exportMeta?.documentTitle}
          primary
        />
      </div>

      <div
        id={pageRootId}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {sections.map((s) => {
          const Component = s.Component;
          return (
            <div
              key={s.id}
              id={`section-${s.id}`}
              style={{ scrollMarginTop: 76 }}
            >
              <div className="export-bar pdf-hide">
                <ExportPdfButton
                  targetId={`section-${s.id}`}
                  sectionTitle={s.navLabel}
                  description={s.description}
                  company={exportMeta?.company}
                  documentTitle={exportMeta?.documentTitle}
                />
              </div>
              <Component />
            </div>
          );
        })}
      </div>
    </div>
  );
}
