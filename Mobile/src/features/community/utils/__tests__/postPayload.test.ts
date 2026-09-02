import { buildPostPayload } from '../postPayload';

describe('buildPostPayload', () => {
  it('제목과 내용의 앞뒤 공백을 털어낸다', () => {
    expect(
      buildPostPayload({
        category: 'free',
        title: '  거제 트레킹  ',
        content: '  함께 가요  ',
        location: '',
      }),
    ).toMatchObject({
      category: 'free',
      title: '거제 트레킹',
      contentText: '함께 가요',
    });
  });

  it('장소 추천에서만 장소를 함께 보낸다', () => {
    expect(
      buildPostPayload({
        category: 'recommend',
        title: '제목',
        content: '내용',
        location: '  갑천생태호수공원  ',
      }).location,
    ).toBe('갑천생태호수공원');

    expect(
      buildPostPayload({
        category: 'free',
        title: '제목',
        content: '내용',
        location: '갑천생태호수공원',
      }).location,
    ).toBeUndefined();
  });
});
