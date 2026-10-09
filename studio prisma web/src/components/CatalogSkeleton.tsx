export function CatalogSkeleton() {
  return (
    <div className="catalog-skeleton" role="status" aria-label="იტვირთება">
      <div className="sk-hero" />
      <div className="sk-block">
        <div className="sk-line" />
        <div className="sk-row">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="sk-poster" />)}
        </div>
      </div>
    </div>
  );
}
