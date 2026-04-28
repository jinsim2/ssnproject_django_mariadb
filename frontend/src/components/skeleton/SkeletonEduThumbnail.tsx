import { Skeleton } from "../ui";

function SkeletonEduThumbnail() {
    return (
        <div className="w-full flex flex-col gap-2">
            <Skeleton className="w-full h-[200px]" />
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-70 h-5" />
        </div>
    );
}

export { SkeletonEduThumbnail };