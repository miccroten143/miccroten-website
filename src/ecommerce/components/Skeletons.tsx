export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-white/60 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-9 bg-gray-200 rounded animate-pulse w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-white/60 overflow-hidden">
      <div className="aspect-[5/3] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LineSkeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}
