import { useQuery } from '@tanstack/react-query';
import { wardService } from '../services/wardService';
import type { WardQueryParams } from '../services/wardService';

export const useWards = (params?: WardQueryParams) => {
  return useQuery({
    queryKey: ['wards', params],
    queryFn: () => wardService.getWards(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
