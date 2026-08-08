import { buildPostPayload } from '../postPayload';

describe('buildPostPayload', () => {
  it('메이트 모집 인원을 정수로 전송한다', () => {
    expect(
      buildPostPayload({
        category: 'mate',
        title: ' 거제 트레킹 ',
        content: ' 함께 가요 ',
        maxParticipants: '4.9',
        location: '',
      }),
    ).toMatchObject({
      category: 'mate',
      title: '거제 트레킹',
      contentText: '함께 가요',
      maxParticipants: 4,
    });
  });

  it('빈 모집 인원은 null로 전송해 수정 값을 지울 수 있다', () => {
    expect(
      buildPostPayload({
        category: 'mate',
        title: '제목',
        content: '내용',
        maxParticipants: '',
        location: '',
      }).maxParticipants,
    ).toBeNull();
  });
});
