export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
      <div className="border-b border-sand-100 bg-sand-50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-sand-200 rounded animate-shimmer"
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="border-b border-sand-50 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-4 bg-sand-100 rounded animate-shimmer"
                style={{
                  width: `${40 + Math.random() * 80}px`,
                  animationDelay: `${rowIdx * 100 + colIdx * 50}ms`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-card border border-sand-100 p-5 animate-shimmer"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-sand-100 rounded w-3/4" />
              <div className="h-3 bg-sand-50 rounded w-1/2" />
            </div>
            <div className="w-12 h-5 bg-sand-100 rounded-full" />
          </div>
          <div className="space-y-2 mt-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex justify-between">
                <div className="h-3 bg-sand-50 rounded w-20" />
                <div className="h-3 bg-sand-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-card p-5 border border-sand-100 animate-shimmer"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-10 h-10 rounded-lg bg-sand-100 mb-3" />
          <div className="h-7 bg-sand-100 rounded w-20 mb-1" />
          <div className="h-4 bg-sand-50 rounded w-28" />
        </div>
      ))}
    </div>
  )
}
