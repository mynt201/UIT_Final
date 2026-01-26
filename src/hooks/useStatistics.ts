import { useQuery } from '@tanstack/react-query';
import { weatherService } from '../services/weatherService';
import { riskService } from '../services/riskService';

// Helper function to fetch all pages
const fetchAllPages = async <T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; pagination: { total: number; pages: number } }>
): Promise<T[]> => {
  const limit = 100; // Max limit per page
  let page = 1;
  let allData: T[] = [];
  let totalPages = 1;

  do {
    const response = await fetchFn(page, limit);
    allData = allData.concat(response.data);
    totalPages = response.pagination.pages;
    page++;
  } while (page <= totalPages);

  return allData;
};

// Hook for daily statistics
export const useDailyStatistics = (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['dailyStatistics', year, month],
    queryFn: async () => {
      // Fetch all weather data pages
      const weatherData = await fetchAllPages(async (page, limit) => {
        const response = await weatherService.getWeatherData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.weatherData || [],
          pagination: response.pagination,
        };
      });

      // Fetch all risk data pages
      const riskData = await fetchAllPages(async (page, limit) => {
        const response = await riskService.getRiskIndexData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.riskData || [],
          pagination: response.pagination,
        };
      });

      return {
        weatherData,
        riskData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Hook for monthly statistics
export const useMonthlyStatistics = (year: number) => {
  const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
  const endDate = new Date(year, 11, 31).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['monthlyStatistics', year],
    queryFn: async () => {
      // Fetch all weather data pages
      const weatherData = await fetchAllPages(async (page, limit) => {
        const response = await weatherService.getWeatherData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.weatherData || [],
          pagination: response.pagination,
        };
      });

      // Fetch all risk data pages
      const riskData = await fetchAllPages(async (page, limit) => {
        const response = await riskService.getRiskIndexData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.riskData || [],
          pagination: response.pagination,
        };
      });

      return {
        weatherData,
        riskData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Hook for yearly statistics
export const useYearlyStatistics = (startYear: number, endYear: number) => {
  const startDate = new Date(startYear, 0, 1).toISOString().split('T')[0];
  const endDate = new Date(endYear, 11, 31).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['yearlyStatistics', startYear, endYear],
    queryFn: async () => {
      // Fetch all weather data pages
      const weatherData = await fetchAllPages(async (page, limit) => {
        const response = await weatherService.getWeatherData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.weatherData || [],
          pagination: response.pagination,
        };
      });

      // Fetch all risk data pages
      const riskData = await fetchAllPages(async (page, limit) => {
        const response = await riskService.getRiskIndexData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.riskData || [],
          pagination: response.pagination,
        };
      });

      return {
        weatherData,
        riskData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Hook for comparison statistics
export const useComparisonStatistics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['comparisonStatistics', startDate, endDate],
    queryFn: async () => {
      // Fetch all weather data pages
      const weatherData = await fetchAllPages(async (page, limit) => {
        const response = await weatherService.getWeatherData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.weatherData || [],
          pagination: response.pagination,
        };
      });

      // Fetch all risk data pages
      const riskData = await fetchAllPages(async (page, limit) => {
        const response = await riskService.getRiskIndexData({
          date_from: startDate,
          date_to: endDate,
          page,
          limit,
        });
        return {
          data: response.riskData || [],
          pagination: response.pagination,
        };
      });

      return {
        weatherData,
        riskData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
