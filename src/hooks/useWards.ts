import { useQuery } from "@tanstack/react-query";
import { wardService } from "../services/wardService";
import type { WardQueryParams } from "../services/wardService";

export const useWards = (params?: WardQueryParams) => {
  return useQuery({
    queryKey: ["wards", params],
    queryFn: () => {
      // Check if user is authenticated before making API call
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("User not authenticated");
      }
      return wardService.getWards(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if authentication error
      if (error?.message === "User not authenticated") {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!localStorage.getItem("authToken"), // Only run query if token exists
  });
};
