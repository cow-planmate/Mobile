import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
});

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (failureCount >= 1 || !axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return (
    status === undefined || status === 408 || status === 429 || status >= 500
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false, 
      staleTime: 1000 * 60 * 5, 
      gcTime: 1000 * 60 * 10, 
    },
  },
});
