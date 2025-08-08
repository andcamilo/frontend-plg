export default function RequestsOverviewSkeleton() {
  const RequestItemSkeleton = () => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-gray-600 shimmer flex-shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4 shimmer"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2 shimmer"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="h-3 bg-gray-700 rounded w-12 shimmer"></div>
        <div className="h-4 bg-gray-600 rounded w-16 shimmer"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-[rgb(21,21,33)] border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-700 rounded w-48 shimmer"></div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full shimmer" />
            <div className="h-3 bg-gray-700 rounded w-12 shimmer"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full shimmer" />
            <div className="h-3 bg-gray-700 rounded w-16 shimmer"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[rgba(168,85,247,0.2)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-600 rounded w-20 shimmer"></div>
            <div className="h-5 bg-gray-500 rounded w-24 shimmer"></div>
          </div>
        </div>
        <div className="bg-[rgba(168,85,247,0.2)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-600 rounded w-24 shimmer"></div>
            <div className="h-5 bg-gray-500 rounded w-24 shimmer"></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-3">
            <div className="w-4 h-4 bg-gray-600 rounded mr-2 shimmer"></div>
            <div className="h-4 bg-gray-700 rounded w-40 shimmer"></div>
          </div>
          <div className="space-y-2 max-h-48 overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <RequestItemSkeleton key={`paid-${index}`} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-3">
            <div className="w-4 h-4 bg-gray-600 rounded mr-2 shimmer"></div>
            <div className="h-4 bg-gray-700 rounded w-44 shimmer"></div>
          </div>
          <div className="space-y-2 max-h-48 overflow-hidden">
            {Array.from({ length: 2 }).map((_, index) => (
              <RequestItemSkeleton key={`pending-${index}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
