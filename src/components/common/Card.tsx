/**
 * Card.tsx — contenedor visual reutilizable con título, subtítulo y badge.
 */
import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  as?: 'h2' | 'h3';
  flush?: boolean;
  children: ReactNode;
}

export function Card({
  title,
  subtitle,
  badge,
  as = 'h2',
  flush,
  children,
}: CardProps) {
  const Heading = as;
  return (
    <section className={`card${flush ? ' card--flush' : ''}`}>
      {(title || badge) && (
        <div className="card__head" style={flush ? { padding: '18px 20px 0' } : undefined}>
          <div className="card__title-wrap">
            {title && <Heading>{title}</Heading>}
            {subtitle && <div className="card__subtitle">{subtitle}</div>}
          </div>
          {badge && <span className="card__badge">{badge}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
