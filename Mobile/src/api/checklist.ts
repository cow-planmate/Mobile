import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

export type ChecklistScope = 'shared' | 'personal';

export interface ChecklistItem {
  itemId: number;
  content: string;
  isChecked: boolean;

  sortOrder: number;
}

export type ChecklistSyncAction = 'create' | 'update' | 'delete';

export interface PlanChecklistSyncItem {
  checklistItemId?: number;
  content?: string;
  isChecked?: boolean;
  sortOrder?: number;
  planId: string;
}

export interface PlanChecklistSyncMessage {
  entity: 'planchecklistitem';
  action: ChecklistSyncAction;
  planChecklistItemDtos: PlanChecklistSyncItem[];
}

export function createPlanChecklistSyncMessage(
  action: ChecklistSyncAction,
  items: PlanChecklistSyncItem | PlanChecklistSyncItem[],
): PlanChecklistSyncMessage {
  return {
    entity: 'planchecklistitem',
    action,
    planChecklistItemDtos: Array.isArray(items) ? items : [items],
  };
}

export const CHECKLIST_CONTENT_MAX_LENGTH = 255;

const scopeBasePath = (planId: string, scope: ChecklistScope) =>
  `/api/plan/${planId}/checklist${scope === 'personal' ? '/me' : ''}`;

const compareChecklistItems = (a: ChecklistItem, b: ChecklistItem) =>
  a.sortOrder - b.sortOrder || a.itemId - b.itemId;

export function normalizeChecklistItems(data: unknown): ChecklistItem[] {
  const rawItems = Array.isArray(data)
    ? data
    : (data as { items?: unknown })?.items;

  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item: any) => ({
      itemId: Number(item?.itemId),
      content: String(item?.content ?? ''),
      isChecked: !!item?.isChecked,
      sortOrder: Number(item?.sortOrder ?? 0),
    }))
    .filter(item => Number.isFinite(item.itemId))
    .sort(compareChecklistItems);
}

export function normalizeChecklistContent(content: string): string {
  const trimmed = (content ?? '').trim();

  if (!trimmed) {
    throw new Error('내용을 입력해 주세요.');
  }
  if (trimmed.length > CHECKLIST_CONTENT_MAX_LENGTH) {
    throw new Error(
      `내용은 ${CHECKLIST_CONTENT_MAX_LENGTH}자를 넘을 수 없습니다.`,
    );
  }

  return trimmed;
}

export async function getChecklist(
  planId: string,
  scope: ChecklistScope,
): Promise<ChecklistItem[]> {
  const response = await axios.get(
    resolveApiUrl(scopeBasePath(planId, scope)),
  );
  return normalizeChecklistItems(response?.data);
}

export async function createChecklistItem(
  planId: string,
  scope: ChecklistScope,
  content: string,
): Promise<number> {
  const response = await axios.post<{ itemId: number }>(
    resolveApiUrl(scopeBasePath(planId, scope)),
    { content: normalizeChecklistContent(content) },
  );
  return Number(response.data?.itemId);
}

export async function editChecklistItemContent(
  planId: string,
  scope: ChecklistScope,
  itemId: number,
  content: string,
): Promise<void> {
  await axios.patch(
    resolveApiUrl(`${scopeBasePath(planId, scope)}/${itemId}`),
    { content: normalizeChecklistContent(content) },
  );
}

export async function editChecklistItemChecked(
  planId: string,
  scope: ChecklistScope,
  itemId: number,
  isChecked: boolean,
): Promise<void> {
  await axios.patch(
    resolveApiUrl(`${scopeBasePath(planId, scope)}/${itemId}/check`),
    { isChecked },
  );
}

export async function deleteChecklistItem(
  planId: string,
  scope: ChecklistScope,
  itemId: number,
): Promise<void> {
  await axios.delete(
    resolveApiUrl(`${scopeBasePath(planId, scope)}/${itemId}`),
  );
}

export async function reorderChecklistItems(
  planId: string,
  scope: ChecklistScope,
  itemIds: number[],
): Promise<void> {
  if (!itemIds.length) {
    throw new Error('정렬할 항목이 없습니다.');
  }

  await axios.patch(resolveApiUrl(`${scopeBasePath(planId, scope)}/order`), {
    itemIds,
  });
}
