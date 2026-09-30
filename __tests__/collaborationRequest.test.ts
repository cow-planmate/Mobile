import {
  collaborationRequestNoun,
  describeAcceptResult,
  describeCollaborationRequest,
  describeRejectResult,
  describeRequestResultMessage,
  describeRequestResultTitle,
  normalizeCollaborationRequestType,
  parseCollaborationRequestResult,
} from '../src/utils/collaborationRequest';

describe('normalizeCollaborationRequestType', () => {
  it('keeps REQUEST as-is', () => {
    expect(normalizeCollaborationRequestType('REQUEST')).toBe('REQUEST');
  });

  it('falls back to INVITE for unknown values', () => {
    expect(normalizeCollaborationRequestType('INVITE')).toBe('INVITE');
    expect(normalizeCollaborationRequestType(undefined)).toBe('INVITE');
    expect(normalizeCollaborationRequestType('SOMETHING_NEW')).toBe('INVITE');
  });
});

describe('요청 종류별 문구', () => {
  it('초대와 편집 권한 요청을 반대로 말하지 않는다', () => {
    expect(describeCollaborationRequest('INVITE')).toContain('초대');
    expect(describeCollaborationRequest('REQUEST')).toContain('편집 권한');
    expect(describeCollaborationRequest('REQUEST')).not.toContain('초대');
  });

  it('수락 결과는 요청 종류에 따라 주체가 다르다', () => {

    expect(describeAcceptResult('INVITE')).toBe('일정에 참여했어요.');
    expect(describeAcceptResult('REQUEST')).toBe('편집자로 추가했어요.');
  });

  it('거절 결과와 실패 제목도 구분한다', () => {
    expect(describeRejectResult('INVITE')).toContain('초대');
    expect(describeRejectResult('REQUEST')).toContain('편집 권한 요청');
    expect(collaborationRequestNoun('INVITE')).toBe('초대');
    expect(collaborationRequestNoun('REQUEST')).toBe('편집 권한 요청');
  });
});

describe('parseCollaborationRequestResult', () => {
  it('서버 페이로드를 결과 객체로 바꾼다', () => {
    expect(
      parseCollaborationRequestResult({
        result: 'ACCEPTED',
        receiverNickname: '홍길동',
        planName: '제주도 여행',
      }),
    ).toEqual({
      status: 'ACCEPTED',
      receiverNickname: '홍길동',
      planName: '제주도 여행',
    });
  });

  it('result가 없거나 모르는 값이면 null', () => {
    expect(parseCollaborationRequestResult(null)).toBeNull();
    expect(parseCollaborationRequestResult('ACCEPTED')).toBeNull();
    expect(parseCollaborationRequestResult({ result: 'PENDING' })).toBeNull();
  });

  it('닉네임·일정명이 빠져도 결과 자체는 살린다', () => {
    expect(parseCollaborationRequestResult({ result: 'REJECTED' })).toEqual({
      status: 'REJECTED',
      receiverNickname: '상대방',
      planName: '',
    });
  });
});

describe('요청 결과 알림 문구', () => {
  it('수락과 거절을 구분한다', () => {
    const accepted = {
      status: 'ACCEPTED' as const,
      receiverNickname: '홍길동',
      planName: '제주도 여행',
    };
    expect(describeRequestResultTitle(accepted)).toBe('요청 수락됨');
    expect(describeRequestResultMessage(accepted)).toBe(
      "홍길동님이 '제주도 여행' 관련 요청을 수락했어요.",
    );

    const rejected = { ...accepted, status: 'REJECTED' as const };
    expect(describeRequestResultTitle(rejected)).toBe('요청 거절됨');
    expect(describeRequestResultMessage(rejected)).toContain('거절했어요');
  });

  it('일정명이 비면 따옴표만 남기지 않는다', () => {
    expect(
      describeRequestResultMessage({
        status: 'ACCEPTED',
        receiverNickname: '홍길동',
        planName: '',
      }),
    ).toBe('홍길동님이 관련 요청을 수락했어요.');
  });
});
