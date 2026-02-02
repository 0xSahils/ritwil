import React from 'react'

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      {...props}
    />
  )
}

export const SkeletonCircle = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-full ${className}`}
      {...props}
    />
  )
}

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-1/3" />
        <SkeletonCircle className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
