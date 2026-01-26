import { useQuery } from "@tanstack/react-query";
import { wardService } from "../services/wardService";

export const useWardStats = () => {
  return useQuery({
    queryKey: ["wardStats"],
    queryFn: async () => {
      try {
        return await wardService.getWardStats();
      } catch (error) {
        console.error("Failed to fetch ward stats from API:", error);
        // Return null to indicate API failure, Dashboard will use fallback calculation
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry 2 times on failure
    refetchOnWindowFocus: false,
  });
};
