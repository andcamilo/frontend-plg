export default function BarChartSkeleton() {
  const skeletonBars = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    height: Math.floor(Math.random() * 80) + 20, // Entre 20% y 100%
  }));

  return (
    <div className="w-full">
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-700 rounded-lg w-64 mb-2 shimmer"></div>
          <div className="h-4 bg-gray-800 rounded w-96 mb-2 shimmer"></div>
          <div className="h-3 bg-gray-800 rounded w-48 shimmer"></div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {/* Y-axis labels skeleton */}
          <div className="flex items-end mb-4">
            <div
              className="w-16 flex flex-col justify-between text-xs pr-3"
              style={{ height: "260px" }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="text-right">
                  <div className="h-3 bg-gray-700 rounded w-8 ml-auto shimmer"></div>
                </div>
              ))}
            </div>

            {/* Chart area skeleton */}
            <div className="flex-1 relative">
              {/* Grid lines skeleton */}
              <div
                className="absolute inset-0 flex flex-col justify-between"
                style={{ height: "240px" }}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="border-t border-gray-700 opacity-30"
                  />
                ))}
              </div>

              {/* Bars skeleton */}
              <div
                className="relative flex items-end justify-between gap-1 sm:gap-2 px-2"
                style={{ height: "240px" }}
              >
                {skeletonBars.map((bar) => (
                  <div
                    key={bar.id}
                    className="flex-1 flex flex-col items-center max-w-20"
                  >
                    {/* Bar skeleton */}
                    <div className="w-full relative flex justify-center">
                      <div
                        className="bg-gray-700 rounded-t-lg shimmer-bar"
                        style={{
                          height: `${bar.height}%`,
                          width: "100%",
                          maxWidth: "60px",
                          minWidth: "20px",
                          animationDelay: `${bar.id * 0.1}s`,
                        }}
                      />
                    </div>

                    {/* Month label skeleton */}
                    <div className="mt-3 h-3 bg-gray-700 rounded w-8 shimmer"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics skeleton */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="h-8 bg-gray-700 rounded mb-2 shimmer"></div>
              <div className="h-3 bg-gray-700 rounded w-16 mx-auto shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
