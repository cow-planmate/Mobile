import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

/**
 * react-query는 기본으로 `navigator.onLine`을 봐 온라인 여부를 판단하는데, RN에는
 * 그 값이 없어 항상 온라인으로 간주한다. 오프라인에서도 쿼리가 그대로 발사돼
 * axios 타임아웃(현재 10초)만큼 기다렸다가 실패하고, 복구돼도 자동 재조회가
 * 없었다. NetInfo로 실제 연결 상태를 알려준다.
 */
onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
});

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

