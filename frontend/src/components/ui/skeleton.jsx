// React import removed - not used

// Base Skeleton Component
export const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-gray-800 rounded ${className}`}
    {...props}
  />
);

// Card Skeleton for statistics and cards
export const CardSkeleton = ({ className = "" }) => (
  <div className={`bg-gray-900/50 border-gray-800 rounded-lg p-4 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-800 rounded w-2/3 mb-2"></div>
    <div className="h-6 bg-gray-800 rounded w-1/3"></div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 6, className = "" }) => (
  <tr className={`border-t border-gray-800/50 ${className}`}>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 6, className = "" }) => (
  <div className={`overflow-x-auto rounded-lg border border-gray-800 ${className}`}>
    <table className="w-full">
      <thead className="bg-gray-900/50">
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-800 rounded w-20 animate-pulse"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Button Skeleton
export const ButtonSkeleton = ({ className = "" }) => (
  <div className={`h-10 w-20 bg-gray-800 rounded-lg animate-pulse ${className}`}></div>
);

// Profile Card Skeleton
export const ProfileCardSkeleton = ({ className = "" }) => (
  <div className={`bg-gray-900/50 rounded-lg p-6 animate-pulse ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-800 rounded w-32"></div>
        <div className="h-4 bg-gray-800 rounded w-24"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  </div>
);

// Job Card Skeleton
export const JobCardSkeleton = ({ className = "" }) => (
  <div className={`bg-gray-900/50 border border-gray-800 rounded-lg p-6 animate-pulse ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-6 bg-gray-800 rounded w-48"></div>
        <div className="h-4 bg-gray-800 rounded w-32"></div>
      </div>
      <div className="h-6 w-16 bg-gray-800 rounded"></div>
    </div>
    <div className="space-y-3 mb-4">
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-2/3"></div>
    </div>
    <div className="flex gap-2 mb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-6 w-16 bg-gray-800 rounded"></div>
      ))}
    </div>
    <div className="flex justify-between items-center">
      <div className="h-4 bg-gray-800 rounded w-20"></div>
      <div className="h-10 w-24 bg-gray-800 rounded"></div>
    </div>
  </div>
);

// Course Card Skeleton
export const CourseCardSkeleton = ({ className = "" }) => (
  <div className={`bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden animate-pulse ${className}`}>
    <div className="h-48 bg-gray-800"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-800 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-800 rounded w-16"></div>
        <div className="h-6 w-20 bg-gray-800 rounded"></div>
      </div>
      <div className="h-10 bg-gray-800 rounded w-full"></div>
    </div>
  </div>
);

// List Item Skeleton
export const ListItemSkeleton = ({ className = "" }) => (
  <div className={`flex items-center space-x-4 p-4 bg-gray-900/50 rounded-lg animate-pulse ${className}`}>
    <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
    </div>
    <div className="h-8 w-16 bg-gray-800 rounded"></div>
  </div>
);

// Analytics Card Skeleton
export const AnalyticsCardSkeleton = ({ className = "" }) => (
  <div className={`bg-gray-900/50 border border-gray-800 rounded-lg p-6 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-800 rounded w-32"></div>
      <div className="w-8 h-8 bg-gray-800 rounded"></div>
    </div>
    <div className="space-y-4">
      <div className="h-8 bg-gray-800 rounded w-20"></div>
      <div className="h-32 bg-gray-800 rounded"></div>
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 4, className = "" }) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-24 animate-pulse"></div>
        <div className="h-10 bg-gray-800 rounded w-full animate-pulse"></div>
      </div>
    ))}
    <div className="h-10 bg-gray-800 rounded w-32 animate-pulse"></div>
  </div>
);
