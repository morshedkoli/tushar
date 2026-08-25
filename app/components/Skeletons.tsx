/** Loading placeholders that mirror real layout, so nothing jumps on load. */

export const RowSkeleton = () => (
  <div className="row" style={{ cursor: "default" }}>
    <span className="row-main">
      <span className="skeleton skeleton-circle" style={{ width: 44, height: 44, flexShrink: 0 }} />
      <span className="stack gap-xs" style={{ gap: 8 }}>
        <span className="skeleton skeleton-line" style={{ width: 120 }} />
        <span className="skeleton skeleton-line" style={{ width: 76, height: 9 }} />
      </span>
    </span>
    <span className="stack gap-xs" style={{ gap: 8, alignItems: "flex-end" }}>
      <span className="skeleton skeleton-line" style={{ width: 68 }} />
      <span className="skeleton skeleton-line" style={{ width: 48, height: 9 }} />
    </span>
  </div>
);

export const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="stack gap-xs">
    {Array.from({ length: rows }, (_, i) => (
      <RowSkeleton key={i} />
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="card-hero" style={{ padding: "1.75rem 1.5rem" }}>
    <div className="hero-content stack" style={{ gap: 14 }}>
      <span className="skeleton skeleton-line" style={{ width: 96, height: 10, opacity: 0.35 }} />
      <span className="skeleton" style={{ width: 190, height: 38, opacity: 0.28, borderRadius: 12 }} />
      <span className="skeleton skeleton-line" style={{ width: 130, height: 10, opacity: 0.22 }} />
    </div>
  </div>
);
