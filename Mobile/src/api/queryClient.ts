import { QueryClient } from '@tanstack/react-query';

/**
 * 전역 React Query Client 인스턴스 설정
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // API 요청 실패 시 재시도 횟수
      refetchOnWindowFocus: false, // 모바일 환경 특성을 고려하여 포커스 시 재조회 비활성화
      staleTime: 1000 * 60 * 5, // 기본 데이터 신선도 유지 시간 (5분)
      gcTime: 1000 * 60 * 10, // 캐시 유지 시간 (10분)
    },
  },
});

