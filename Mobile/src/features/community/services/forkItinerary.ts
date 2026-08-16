import axios from 'axios';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { Itinerary } from '../types';
import { buildCreatePlanRequest } from '../utils/itineraryToPlan';
import { forkPost } from './communityApi';

export interface ForkItineraryResult {
  planId: string;

  adjustedBlocks: number;
}

export async function forkItinerary(
  postId: number | string,
  itinerary: Itinerary,
  startDate: Date,

  title: string,
): Promise<ForkItineraryResult> {
  const { body, adjustedBlocks } = buildCreatePlanRequest(itinerary, startDate);

  const created = await axios.post(resolveApiUrl('/api/plan/full'), body);
  const planId = created.data?.planId;
  if (!planId) {
    throw new Error('플랜 생성 응답에 planId가 없습니다.');
  }

  try {
    await axios.patch(resolveApiUrl(`/api/plan/${planId}/name`), {

      planName: title.slice(0, 100),
    });
  } catch {

  }

  try {
    await forkPost(postId);
  } catch {

  }

  return { planId: String(planId), adjustedBlocks };
}
