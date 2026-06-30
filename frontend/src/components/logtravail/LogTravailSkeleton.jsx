import { TableSkeleton } from "../Skeleton";

export default function LogTravailSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="h-8 bg-sand-100 rounded w-48 animate-shimmer" />
                <div className="h-9 bg-sand-100 rounded w-36 animate-shimmer" />
            </div>
            <TableSkeleton rows={4} cols={9} />
        </div>
    );
}
