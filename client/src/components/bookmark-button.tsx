import { Bookmark } from "lucide-react";
import { useBookmarks, useAddBookmark, useRemoveBookmark } from "@/hooks/use-bookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  programType: string;
  programId: number;
  className?: string;
}

export function BookmarkButton({ programType, programId, className }: BookmarkButtonProps) {
  const { data: bookmarks } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const isBookmarked = bookmarks?.some(
    (b) => b.programType === programType && b.programId === programId
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      removeBookmark.mutate({ programType, programId });
    } else {
      addBookmark.mutate({ programType, programId });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-1 rounded-md transition-colors hover:bg-accent",
        isBookmarked ? "text-amber-500" : "text-muted-foreground",
        className
      )}
      title={isBookmarked ? "북마크 해제" : "북마크 추가"}
    >
      <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
    </button>
  );
}
