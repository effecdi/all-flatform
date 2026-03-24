import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Bookmark {
  id: number;
  userId: number;
  programType: string;
  programId: number;
  createdAt: string;
}

export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: ["/api/bookmarks"],
  });
}

export function useAddBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { programType: string; programId: number }) => {
      const res = await apiRequest("POST", "/api/bookmarks", data);
      return res.json() as Promise<Bookmark>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ programType, programId }: { programType: string; programId: number }) => {
      await apiRequest("DELETE", `/api/bookmarks/${programType}/${programId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });
}
