import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

// ────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────

/** 체크리스트 종류. shared는 일정 참여자 공용, personal은 본인만 보는 목록이다. */
export type ChecklistScope = 'shared' | 'personal';

/**
 * 체크리스트 항목.
 * 서버 ChecklistItemDto와 필드명을 맞춘다(isChecked, checked 아님).
 */
export interface ChecklistItem {
  itemId: number;
  content: string;
  isChecked: boolean;
  /** 0부터 시작한다. 서버가 목록 순서를 이 값으로 관리한다. */
  sortOrder: number;
}

/** 서버 content 컬럼 길이 제한과 동일하다. */
export const CHECKLIST_CONTENT_MAX_LENGTH = 255;

// ────────────────────────────────────────────────
// 내부 유틸
// ────────────────────────────────────────────────

const scopeBasePath = (planId: string, scope: ChecklistScope) =>
  `/api/plan/${planId}/checklist${scope === 'personal' ? '/me' : ''}`;

/**
 * 항목 순서를 정한다.
 *
 * sortOrder만으로 비교하면 안 된다. 서버는 새 항목의 sortOrder를 "현재 개수"로 정하는데
 * 삭제 시 남은 항목의 번호를 다시 매기지 않는다. 0,1,2에서 0번을 지우고 새로 추가하면
 * 개수가 2라서 새 항목도 2가 되어 기존 2번과 값이 겹친다. 값이 같을 때 순서가 호출마다
 * 뒤바뀌지 않도록 itemId를 2차 기준으로 쓴다.
 */
const compareChecklistItems = (a: ChecklistItem, b: ChecklistItem) =>
  a.sortOrder - b.sortOrder || a.itemId - b.itemId;

/** 응답이 {items:[...]}든 배열이든 받아 정렬된 항목 배열로 맞춘다. */
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

/**
 * 서버로 보내기 전에 내용을 다듬고 검증한다.
 *
 * 서버는 @NotBlank·@Size(max=255)로 400을 돌려주지만, 왕복 한 번을 아끼고
 * 사용자에게 바로 이유를 알리기 위해 앱에서 먼저 막는다.
 */
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

// ────────────────────────────────────────────────
// 체크리스트 API
//
// 공유·개인 모두 해당 일정의 참여자(소유자 또는 편집자)만 호출할 수 있다.
// 개인 항목은 여기에 더해 본인 소유가 아니면 403(CHECKLIST_002)이 온다.
//
// 주의: REST로 반영한 변경은 실시간 편집 세션에 접속 중인 다른 사용자에게
// 자동으로 전달되지 않는다(서버 1차 구현에서 브로드캐스트 보류). 화면에서는
// 포커스 시점에 다시 조회해야 최신 상태를 볼 수 있다.
// ────────────────────────────────────────────────

/** 체크리스트 조회 */
export async function getChecklist(
  planId: string,
  scope: ChecklistScope,
): Promise<ChecklistItem[]> {
  const response = await axios.get(
    resolveApiUrl(scopeBasePath(planId, scope)),
  );
  return normalizeChecklistItems(response?.data);
}

/** 체크리스트 항목 추가. 생성된 항목 ID를 돌려준다. */
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

/** 체크리스트 항목 내용 수정 */
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

/** 체크리스트 항목 완료 여부 변경 */
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

/** 체크리스트 항목 삭제 */
export async function deleteChecklistItem(
  planId: string,
  scope: ChecklistScope,
  itemId: number,
): Promise<void> {
  await axios.delete(
    resolveApiUrl(`${scopeBasePath(planId, scope)}/${itemId}`),
  );
}

/**
 * 체크리스트 순서 변경.
 *
 * 서버는 받은 배열의 인덱스를 그대로 sortOrder로 덮어쓴다. 일부만 보내면 보내지 않은
 * 항목과 번호가 겹치므로 반드시 해당 목록 **전체**를 원하는 순서로 보내야 한다.
 */
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
