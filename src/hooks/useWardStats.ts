import { useQuery } from '@tanstack/react-query';
import { wardService } from '../services/wardService';

export const useWardStats = () => {
  return useQuery({
    queryKey: ['wardStats'],
    queryFn: () => wardService.getWardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
