import { Skeleton } from "@/components/ui/skeleton";

export function FlashcardSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="h-[350px] w-full rounded-xl border-2 bg-card p-6">
        <div className="flex h-full flex-col items-center justify-center">
          <Skeleton className="h-12 w-3/4 rounded-md" />
          <Skeleton className="mt-8 h-4 w-1/3 rounded-md" />
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-10 w-28 rounded-md" />
        <div className="flex flex-col items-center">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="mt-1 h-2 w-32 rounded-full" />
        </div>
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  );
}
