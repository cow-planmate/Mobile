import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

/**
 * 일정 소유 여부 판정 훅.
 *
 * 서버는 일정 조회 응답(GetPlanResponse·GetCompletePlanResponse)에 소유자를 담지 않고,
 * 편집자 목록(GET /editors)도 EDITOR 역할만 돌려주므로 화면이 가진 일정 데이터만으로는
 * 소유 여부를 알 수 없다. 프로필 응답이 myPlans(소유)와 editablePlans(편집 권한만)를
 * 나눠 주므로 이것을 유일한 판정 근거로 쓴다. 웹도 같은 경로를 쓴다(planOwnership.js).
 *
 * useUserProfile은 일정마다 날짜를 채우려 상세를 한 번씩 더 조회한다(N+1). 소유 여부만
 * 필요한 화면에서 그 비용을 낼 이유가 없어 ID 목록만 뽑는 별도 쿼리로 둔다.
 */
export const OWNED_PLAN_IDS_QUERY_KEY = ['ownedPlanIds'] as const;

async function fetchOwnedPlanIds(): Promise<string[]> {
  const { data } = await axios.get(resolveApiUrl('/api/user/profile'));

  return (data?.myPlans ?? [])
    .map((plan: any) => String(plan?.planId ?? '').toLowerCase())
    .filter(Boolean);
}

export function usePlanOwnership(planId?: string | null) {
  const { data, isLoading, isError } = useQuery({
    queryKey: OWNED_PLAN_IDS_QUERY_KEY,
    queryFn: fetchOwnedPlanIds,
    // 소유권은 초대·수락으로만 바뀌어 화면 전환마다 다시 물을 값이 아니다.
    staleTime: 1000 * 60 * 10,
  });

  /**
   * 판정 전에는 소유자가 아닌 것으로 본다.
   * 소유자에게 버튼이 잠깐 늦게 보이는 쪽이, 편집자에게 눌러도 403이 나는 버튼을
   * 보여주는 쪽보다 낫다.
   */
  const isOwner =
    !!planId &&
    !!data?.includes(String(planId).toLowerCase());

  return { isOwner, isLoading, isError };
}
