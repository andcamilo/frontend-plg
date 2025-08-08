export default function BalanceCardSkeleton() {
  return (
    <div className="bg-[rgb(21,21,33)] border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-700 rounded w-32 shimmer"></div>

        <div className="w-8 h-8 bg-gray-700 rounded-lg shimmer"></div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <div className="h-10 md:h-12 bg-gray-600 rounded-lg w-40 md:w-48 shimmer"></div>
          <div className="h-6 bg-gray-700 rounded w-8 shimmer"></div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-700">
            <div className="w-3 h-3 bg-gray-600 rounded-full shimmer"></div>
            <div className="h-3 bg-gray-600 rounded w-8 shimmer"></div>
          </div>
          <div className="h-3 bg-gray-700 rounded w-20 shimmer"></div>
        </div>
      </div>
    </div>
  );
}
