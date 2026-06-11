import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export const GridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

export default GridSkeleton;
