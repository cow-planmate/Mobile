import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Number of retries on API request failure
      refetchOnWindowFocus: false, // Mobile doesn't benefit from refetching on window focus
      staleTime: 1000 * 60 * 5, // 5 minutes stale time default
      gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes (formerly cacheTime)
    },
  },
});
