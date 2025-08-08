export default function CircularChartSkeleton() {
  return (
    <div className="w-full max-w-sm">
      <div className="relative bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700 animate-pulse">
        {/* Header skeleton */}
        <div className="text-center mb-6">
          <div className="h-6 bg-gray-700 rounded-lg w-48 mx-auto mb-1 shimmer"></div>
          <div className="h-4 bg-gray-800 rounded w-32 mx-auto shimmer"></div>
        </div>

        {/* Chart skeleton */}
        <div className="relative flex justify-center">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-48 h-48 rounded-full border-8 border-gray-700 animate-spin-slow">
              <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-gray-600 animate-spin"></div>
            </div>

            {/* Inner circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-8 bg-gray-700 rounded w-12 mx-auto mb-1 shimmer"></div>
                  <div className="h-3 bg-gray-700 rounded w-8 mx-auto shimmer"></div>
                </div>
              </div>
            </div>

            {/* Animated segments */}
            <div className="absolute inset-0">
              <svg
                width="192"
                height="192"
                viewBox="0 0 192 192"
                className="transform -rotate-90"
              >
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="76"
                  fill="transparent"
                  stroke="#374151"
                  strokeWidth="20"
                  className="opacity-30"
                />

                {/* Animated segment 1 */}
                <circle
                  cx="96"
                  cy="96"
                  r="76"
                  fill="transparent"
                  stroke="#6B7280"
                  strokeWidth="20"
                  strokeDasharray="150 477"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="animate-pulse"
                />

                {/* Animated segment 2 */}
                <circle
                  cx="96"
                  cy="96"
                  r="76"
                  fill="transparent"
                  stroke="#4B5563"
                  strokeWidth="20"
                  strokeDasharray="200 477"
                  strokeDashoffset="-150"
                  strokeLinecap="round"
                  className="animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="mt-8 space-y-4">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800"
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-gray-700 shimmer"></div>
                <div className="h-4 bg-gray-700 rounded w-24 shimmer"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-700 rounded w-8 mb-1 shimmer"></div>
                <div className="h-3 bg-gray-700 rounded w-10 shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
