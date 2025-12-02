type Props = { className?: string }

export function SkeletonLine({ className = '' }: Props) {
  return <div className={`h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
}

export function SkeletonCard({ className = '' }: Props) {
  return (
    <div className={`rounded-2xl p-4 bg-white dark:bg-gray-800 ${className}`}>
      <div className="space-y-3">
        <SkeletonLine />
        <SkeletonLine />
        <SkeletonLine className="w-2/3" />
      </div>
    </div>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <SkeletonLine className="w-8" />
          <SkeletonLine className="flex-1" />
        </div>
      ))}
    </div>
  )
}

