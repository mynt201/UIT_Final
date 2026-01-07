import { api } from '../plugins/axios';
import type { WeatherData } from '../types/dataManagement';

export interface WeatherQueryParams {
  page?: number;
  limit?: number;
  ward_id?: string;
  date_from?: string;
  date_to?: string;
  is_forecast?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface WeatherPaginationResponse {
  weatherData: WeatherData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface WeatherStatsResponse {
  ward: {
    _id: string;
    ward_name: string;
    district: string;
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  statistics: {
    count: number;
    avgTemperature: number;
    maxTemperature: number;
    minTemperature: number;
    avgHumidity: number;
    totalRainfall: number;
    avgRainfall: number;
    maxRainfall: number;
    rainyDays: number;
  };
}

export interface BulkImportWeatherResponse {
  message: string;
  results: {
    successful: Array<{ id: string; ward_name: string; date: string }>;
    failed: Array<{ ward_id: string; date: string; error: string }>;
    duplicates: Array<{ ward_id: string; ward_name: string; date: string; error: string }>;
  };
}

// Weather API calls
export const weatherService = {
  // Get weather data with pagination and filtering
  async getWeatherData(params?: WeatherQueryParams): Promise<WeatherPaginationResponse> {
    const response = await api.get('/weather', { params });
    return response.data;
  },

  // Get weather data by ID
  async getWeatherById(id: string): Promise<{ weather: WeatherData }> {
    const response = await api.get(`/weather/${id}`);
    return response.data;
  },

  // Create weather data (Admin only)
  async createWeatherData(
    weatherData: Omit<WeatherData, '_id' | 'recorded_at' | 'updated_at'>
  ): Promise<{ weather: WeatherData }> {
    const response = await api.post('/weather', weatherData);
    return response.data;
  },

  // Update weather data (Admin only)
  async updateWeatherData(
    id: string,
    weatherData: Partial<WeatherData>
  ): Promise<{ weather: WeatherData }> {
    const response = await api.put(`/weather/${id}`, weatherData);
    return response.data;
  },

  // Delete weather data (Admin only)
  async deleteWeatherData(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/weather/${id}`);
    return response.data;
  },

  // Get weather data for a specific ward
  async getWeatherByWard(
    wardId: string,
    params?: { date_from?: string; date_to?: string; limit?: number }
  ): Promise<{
    ward: {
      _id: string;
      ward_name: string;
      district: string;
    };
    weatherData: WeatherData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get(`/weather/ward/${wardId}`, { params });
    return response.data;
  },

  // Get latest weather data for all wards
  async getLatestWeather(): Promise<{
    latestWeather: WeatherData[];
    count: number;
  }> {
    const response = await api.get('/weather/latest');
    return response.data;
  },

  // Get weather statistics for a ward
  async getWeatherStats(wardId: string, days: number = 30): Promise<WeatherStatsResponse> {
    const response = await api.get(`/weather/stats/${wardId}`, { params: { days } });
    return response.data;
  },

  // Bulk import weather data (Admin only)
  async bulkImportWeather(
    weatherData: Omit<WeatherData, '_id' | 'recorded_at' | 'updated_at'>[]
  ): Promise<BulkImportWeatherResponse> {
    const response = await api.post('/weather/bulk-import', { weatherData });
    return response.data;
  },
};
