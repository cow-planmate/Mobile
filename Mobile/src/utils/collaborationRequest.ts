/**
 * 협업 요청 종류별 문구 helper.
 *
 * 백엔드 CollaborationRequestType은 두 가지이고, 받는 사람 입장에서 의미가 반대다.
 * - INVITE : 남의 일정에 편집자로 초대받음 → 수락하면 내가 그 일정에 참여한다
 * - REQUEST: 내 일정의 편집 권한을 요청받음 → 수락하면 상대가 내 일정 편집자가 된다
 *
 * 알림 목록·수락/거절 안내가 세 화면(홈/여행피드/커뮤니티)에 흩어져 있어
 * 문구를 여기 모아둔다.
 */

export type CollaborationRequestType = 'INVITE' | 'REQUEST';

/** 서버가 예상 밖의 값을 주더라도 초대로 취급한다(기존 동작 유지). */
export function normalizeCollaborationRequestType(
  raw: unknown,
): CollaborationRequestType {
  return raw === 'REQUEST' ? 'REQUEST' : 'INVITE';
}

/** 알림 목록 한 줄: "{닉네임}님이 '{일정명}' " 뒤에 붙는 서술부 */
export function describeCollaborationRequest(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST'
    ? '일정의 편집 권한을 요청했습니다.'
    : '일정에 초대했습니다.';
}

/** 수락 성공 안내 */
export function describeAcceptResult(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST'
    ? '편집자로 추가했습니다.'
    : '일정에 참여했습니다.';
}

/** 거절 성공 안내 */
export function describeRejectResult(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST'
    ? '편집 권한 요청을 거절했습니다.'
    : '초대를 거절했습니다.';
}

/** 실패 알림 제목에 쓰는 요청 명칭 */
export function collaborationRequestNoun(
  type: CollaborationRequestType | undefined,
): string {
  return type === 'REQUEST' ? '편집 권한 요청' : '초대';
}
