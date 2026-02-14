import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PLANS_KEY = 'draft_plan_ids';

/**
 * Draft plan storage utility.
 * Plans are marked as "draft" when initially created (POST /api/plan).
 * They remain drafts until the user clicks "일정 생성 완료" (complete).
 * MyPage filters out draft plans so they don't appear until completed.
 */

/** Get all draft plan IDs */
export async function getDraftPlanIds(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_PLANS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

/** Mark a planId as draft (not yet completed) */
export async function addDraftPlan(planId: number): Promise<void> {
  try {
    const ids = await getDraftPlanIds();
    if (!ids.includes(planId)) {
      ids.push(planId);
      await AsyncStorage.setItem(DRAFT_PLANS_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    console.warn('Failed to save draft plan:', e);
  }
}

/** Remove planId from draft list (plan is now completed) */
export async function removeDraftPlan(planId: number): Promise<void> {
  try {
    const ids = await getDraftPlanIds();
    const filtered = ids.filter(id => id !== planId);
    await AsyncStorage.setItem(DRAFT_PLANS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to remove draft plan:', e);
  }
}

/** Check if a planId is a draft */
export async function isDraftPlan(planId: number): Promise<boolean> {
  const ids = await getDraftPlanIds();
  return ids.includes(planId);
}
