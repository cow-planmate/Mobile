
export type CollaborationRequestType = 'INVITE' | 'REQUEST';

export function normalizeCollaborationRequestType(
  raw: unknown,
): CollaborationRequestType {
  return raw === 'REQUEST' ? 'REQUEST' : 'INVITE';
}

export function describeCollaborationRequest(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST'
    ? '일정의 편집 권한을 요청했습니다.'
    : '일정에 초대했습니다.';
}

export function describeAcceptResult(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST'
    ? '편집자로 추가했습니다.'
    : '일정에 참여했습니다.';
}

export function describeRejectResult(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST'
    ? '편집 권한 요청을 거절했습니다.'
    : '초대를 거절했습니다.';
}

export function collaborationRequestNoun(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST' ? '편집 권한 요청' : '초대';
}

export interface CollaborationRequestResult {
  status: 'ACCEPTED' | 'REJECTED';

  receiverNickname: string;
  planName: string;
}

export function parseCollaborationRequestResult(
  raw: unknown,
): CollaborationRequestResult | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const { result, receiverNickname, planName } = raw as Record<string, unknown>;
  if (result !== 'ACCEPTED' && result !== 'REJECTED') {
    return null;
  }

  return {
    status: result,
    receiverNickname:
      typeof receiverNickname === 'string' ? receiverNickname : '상대방',
    planName: typeof planName === 'string' ? planName : '',
  };
}

export function describeRequestResultTitle(
  result: CollaborationRequestResult,
): string {
  return result.status === 'ACCEPTED' ? '요청 수락됨' : '요청 거절됨';
}

export function describeRequestResultMessage(
  result: CollaborationRequestResult,
): string {
  const target = result.planName ? `'${result.planName}' ` : '';
  const verb = result.status === 'ACCEPTED' ? '수락했어요' : '거절했어요';
  return `${result.receiverNickname}님이 ${target}관련 요청을 ${verb}.`;
}
