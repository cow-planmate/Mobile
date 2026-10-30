import { ReportReason } from '../types';

export const REPORT_DETAILS_MAX_LENGTH = 1000;

/** 웹 신고 창과 같은 사유·문구. 서버 enum 값이므로 value는 바꾸지 않는다. */
export const REPORT_REASONS: {
  value: ReportReason;
  label: string;
  description: string;
}[] = [
  { value: 'SPAM', label: '스팸 / 광고', description: '반복 게시글, 홍보 또는 광고성 내용' },
  { value: 'ABUSE', label: '욕설 / 비방 / 혐오', description: '다른 사람을 모욕하거나 혐오를 조장하는 내용' },
  { value: 'INAPPROPRIATE', label: '부적절한 콘텐츠', description: '음란물, 폭력적이거나 불법적인 내용' },
  { value: 'PRIVACY', label: '개인정보 침해', description: '동의 없이 공개된 개인정보' },
  { value: 'OTHER', label: '기타', description: '위 항목에 해당하지 않는 문제' },
];

/** 기타는 이유를 적지 않으면 무엇이 문제인지 알 수 없어 상세 내용을 필수로 한다. */
export const canSubmitReport = (reason: ReportReason | '', details: string) =>
  !!reason && (reason !== 'OTHER' || details.trim().length > 0);
