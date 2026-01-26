import type { WeatherData } from './dataManagement';

// Upload result interface for weather data
export interface WeatherUploadResult {
  successful: number;
  failed: number;
  duplicates: number;
  details: {
    row: number;
    message: string;
    data?: Partial<WeatherData>;
  }[];
}

// CSV weather data interface
export interface CSVWeatherData {
  Ngày: string;
  'Mã phường xã': string;
  'Nhiệt độ (°C)': string;
  'Độ ẩm (%)': string;
  'Tốc độ gió (km/h)': string;
  'Hướng gió': string;
  'Lượng mưa (mm)': string;
  'Áp suất (hPa)': string;
  'Mô tả thời tiết': string;
}

// Weather form data interface
export interface WeatherFormData extends Omit<WeatherData, 'id' | '_id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

// Weather validation result
export interface WeatherValidationResult {
  valid: Partial<WeatherData>[];
  invalid: {
    row: number;
    message: string;
    data?: Partial<WeatherData>;
  }[];
}

// Weather table column accessor types
export type WeatherTableAccessor = keyof WeatherData | '_id' | 'id';