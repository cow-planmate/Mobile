import { REPORT_REASONS, canSubmitReport } from '../report';

describe('신고 사유', () => {
  it('서버가 받는 다섯 가지 사유를 모두 갖는다', () => {
    expect(REPORT_REASONS.map(item => item.value)).toEqual([
      'SPAM',
      'ABUSE',
      'INAPPROPRIATE',
      'PRIVACY',
      'OTHER',
    ]);
  });
});

describe('canSubmitReport', () => {
  it('사유를 고르지 않으면 접수할 수 없다', () => {
    expect(canSubmitReport('', '내용')).toBe(false);
  });

  it('기타가 아니면 상세 내용 없이도 접수할 수 있다', () => {
    expect(canSubmitReport('SPAM', '')).toBe(true);
  });

  it('기타는 공백만 있는 상세 내용으로는 접수할 수 없다', () => {
    expect(canSubmitReport('OTHER', '   ')).toBe(false);
    expect(canSubmitReport('OTHER', '이유')).toBe(true);
  });
});
