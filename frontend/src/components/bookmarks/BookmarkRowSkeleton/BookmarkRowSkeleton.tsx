import { Skeleton } from '@/components/ui/skeleton';

function BookmarkRowSkeleton() {
  return (
    <>
      <Skeleton className="h-3.5 w-56" />
      <Skeleton className="h-3.5 w-40" />
      <span className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </span>
    </>
  );
}

export default BookmarkRowSkeleton;
