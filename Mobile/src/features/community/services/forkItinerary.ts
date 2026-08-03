import axios from 'axios';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { Itinerary } from '../types';
import { buildCreatePlanRequest } from '../utils/itineraryToPlan';
import { forkPost } from './communityApi';

/**
 * 여행기 "가져가기".
 *
 * 집계용 fork API를 부르는 것만으로는 아무 일도 일어나지 않는다. 실제로는
 * 스냅샷으로 Backend-v2에 새 플랜을 만든 뒤에야 커뮤니티에 포크를 기록한다.
 * 복제가 실패했는데 가져간 것으로 집계되면 안 되므로 이 순서가 중요하다.
 */

export interface ForkItineraryResult {
  planId: string;
  /** 시간이 겹쳐 뒤로 밀린 블록 수 */
  adjustedBlocks: number;
}

export async function forkItinerary(
  postId: number | string,
  itinerary: Itinerary,
  startDate: Date,
  /** 새 플랜 이름으로 쓸 여행기 제목 */
  title: string,
): Promise<ForkItineraryResult> {
  const { body, adjustedBlocks } = buildCreatePlanRequest(itinerary, startDate);

  const created = await axios.post(resolveApiUrl('/api/plan/full'), body);
  const planId = created.data?.planId;
  if (!planId) {
    throw new Error('플랜 생성 응답에 planId가 없습니다.');
  }

  // 플랜 이름은 목적지명으로 생성되므로 여행기 제목으로 바꿔 목록에서 찾기 쉽게
  // 한다. 실패해도 복제 자체는 성공이므로 막지 않는다.
  try {
    await axios.patch(resolveApiUrl(`/api/plan/${planId}/name`), {
      // 플랜 이름은 100자 제한, 여행기 제목은 255자까지 가능
      planName: title.slice(0, 100),
    });
  } catch {
    // 이름 변경 실패는 무시한다
  }

  // 복제가 끝난 뒤에만 포크로 집계한다
  try {
    await forkPost(postId);
  } catch {
    // 집계 실패가 복제 성공을 되돌릴 수는 없다
  }

  return { planId: String(planId), adjustedBlocks };
}
