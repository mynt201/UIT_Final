import { useQuery } from "@tanstack/react-query";
import { weatherService } from "../services/weatherService";
import type { WeatherQueryParams } from "../services/weatherService";

export const useWeather = (params?: WeatherQueryParams) => {
  return useQuery({
    queryKey: ["weather", params],
    queryFn: () => {
      return weatherService.getWeatherData(params);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount) => {
      return failureCount < 3;
    }, // Only run query if token exists
  });
};
