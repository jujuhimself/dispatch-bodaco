
import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  className?: string;
  rows?: number;
}

export function SkeletonCard({ className, rows = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2">
        {Array(rows).fill(0).map((_, i) => (
          <Skeleton key={i} className={`h-4 w-${i === rows - 1 ? '3/4' : 'full'}`} />
        ))}
      </div>
    </div>
  );
}

interface SkeletonDashboardProps {
  className?: string;
  cards?: number;
}

export function SkeletonDashboard({ className, cards = 4 }: SkeletonDashboardProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array(cards).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ className, rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="grid grid-cols-4 gap-4">
        {Array(columns).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          {Array(columns).fill(0).map((_, j) => (
            <Skeleton key={j} className="h-12" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonFormProps {
  className?: string;
  fields?: number;
}

export function SkeletonForm({ className, fields = 4 }: SkeletonFormProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array(fields).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  );
}
