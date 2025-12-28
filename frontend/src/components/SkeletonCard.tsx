const SkeletonCard = () => {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
      <div className="aspect-[2/3] skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-1/2 rounded skeleton-shimmer" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          <div className="h-5 w-12 rounded-full skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
