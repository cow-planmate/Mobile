import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PLANS_KEY = 'draft_plan_ids';

/**
 * 임시 저장(드래프트) 일정 로컬 스토리지 유틸리티
 * - 최초 생성 시(POST /api/plan) 일정은 임시 저장 상태로 관리됩니다.
 * - 사용자가 "일정 생성 완료" 버튼을 누르면 임시 목록에서 제거됩니다.
 * - 내 일정(마이페이지) 목록에서 완료 전 임시 일정을 필터링하는 데 활용됩니다.
 */

/**
 * 저장된 모든 임시 일정 ID 목록 조회
 */
export async function getDraftPlanIds(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_PLANS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

/**
 * 일정을 임시 저장 목록에 추가
 * @param planId 일정 ID
 */
export async function addDraftPlan(planId: number): Promise<void> {
  try {
    const ids = await getDraftPlanIds();
    if (!ids.includes(planId)) {
      ids.push(planId);
      await AsyncStorage.setItem(DRAFT_PLANS_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    console.warn('임시 저장 일정 추가 실패:', e);
  }
}

/**
 * 임시 저장 목록에서 일정 제거 (생성 완료 처리 시)
 * @param planId 일정 ID
 */
export async function removeDraftPlan(planId: number): Promise<void> {
  try {
    const ids = await getDraftPlanIds();
    const filtered = ids.filter(id => id !== planId);
    await AsyncStorage.setItem(DRAFT_PLANS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('임시 저장 일정 제거 실패:', e);
  }
}

/**
 * 특정 일정의 임시 저장 여부 확인
 * @param planId 일정 ID
 */
export async function isDraftPlan(planId: number): Promise<boolean> {
  const ids = await getDraftPlanIds();
  return ids.includes(planId);
}

