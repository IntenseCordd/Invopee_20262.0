/**
 * App.tsx — cáscara de la aplicación.
 * Alterna entre "Modo análisis" (menú lateral con todas las secciones,
 * fórmulas y edición) y "Modo presentación" (diapositivas interactivas).
 */
import { useMemo, useState, type ComponentType } from 'react';
import { useProblem } from './state/ProblemContext';
import {
  SECTIONS,
  PAGES,
  presentationSections,
  type PageId,
} from './sections';
import { OverviewPage } from './pages/OverviewPage';
import { DecisionAnalysisPage } from './pages/DecisionAnalysisPage';
import { SampleInformationPage } from './pages/SampleInformationPage';
import { GameTheoryPage } from './pages/GameTheoryPage';
import { QueuingPage } from './pages/QueuingPage';

const PAGE_COMPONENTS: Record<PageId, ComponentType> = {
  overview: OverviewPage,
  decision: DecisionAnalysisPage,
  sample: SampleInformationPage,
  game: GameTheoryPage,
  queuing: QueuingPage,
};

type Mode = 'analysis' | 'presentation';

export default function App() {
  const { data } = useProblem();
  const [mode, setMode] = useState<Mode>('analysis');

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <strong>Investigación de Operaciones · {data.meta.company}</strong>
          <span>{data.meta.title}</span>
        </div>
        <div className="topbar__spacer" />
        <div className="mode-switch" role="tablist">
          <button
            className={mode === 'analysis' ? 'active' : ''}
            onClick={() => setMode('analysis')}
          >
            Modo análisis
          </button>
          <button
            className={mode === 'presentation' ? 'active' : ''}
            onClick={() => setMode('presentation')}
          >
            Modo presentación
          </button>
        </div>
      </header>

      {mode === 'analysis' ? <AnalysisMode /> : <PresentationMode />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modo análisis                                                              */
/* -------------------------------------------------------------------------- */
function AnalysisMode() {
  const [activePage, setActivePage] = useState<PageId>('overview');

  const grouped = useMemo(() => {
    const map: Record<PageId, typeof SECTIONS> = {
      overview: [],
      decision: [],
      sample: [],
      game: [],
      queuing: [],
    };
    for (const s of SECTIONS) map[s.page].push(s);
    return map;
  }, []);

  const goToSection = (page: PageId, sectionId: string) => {
    setActivePage(page);
    requestAnimationFrame(() => {
      document
        .getElementById(`section-${sectionId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const PageComponent = PAGE_COMPONENTS[activePage];

  return (
    <div className="layout">
      <nav className="sidebar">
        {PAGES.map((page) => (
          <div key={page.id}>
            <button
              className={`sidebar__group-label${
                activePage === page.id ? ' active' : ''
              }`}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                color:
                  activePage === page.id ? 'var(--primary)' : undefined,
                fontWeight: activePage === page.id ? 700 : undefined,
              }}
              onClick={() => setActivePage(page.id)}
            >
              {page.label}
            </button>
            {grouped[page.id].map((s, i) => (
              <button
                key={s.id}
                className="nav-item"
                onClick={() => goToSection(page.id, s.id)}
              >
                <span className="nav-item__num">{i + 1}</span>
                {s.navLabel}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <main className="content">
        <div className="content__inner">
          <PageComponent />
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modo presentación                                                          */
/* -------------------------------------------------------------------------- */
function PresentationMode() {
  const slides = useMemo(() => presentationSections(), []);
  const [index, setIndex] = useState(0);
  const Slide = slides[index].Component;

  const go = (delta: number) =>
    setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));

  return (
    <main className="content">
      <div className="content__inner">
        <div className="present-nav">
          <button className="btn" onClick={() => go(-1)} disabled={index === 0}>
            ← Anterior
          </button>
          <span className="muted">
            {index + 1} / {slides.length} · {slides[index].navLabel}
          </span>
          <button
            className="btn btn--primary"
            onClick={() => go(1)}
            disabled={index === slides.length - 1}
          >
            Siguiente →
          </button>
        </div>

        <Slide />

        <div className="present-dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`present-dot${i === index ? ' active' : ''}`}
              title={s.navLabel}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
