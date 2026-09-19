import { buildPostPayload } from '../postPayload';

describe('buildPostPayload', () => {
  it('제목과 내용의 앞뒤 공백을 털어낸다', () => {
    expect(
      buildPostPayload({
        category: 'free',
        title: '  거제 트레킹  ',
        content: '  함께 가요  ',
      }),
    ).toMatchObject({
      category: 'free',
      title: '거제 트레킹',
      contentText: '함께 가요',
    });
  });

  it('지정한 카테고리(free, qna)를 페이로드에 반영한다', () => {
    expect(
      buildPostPayload({
        category: 'qna',
        title: '제주도 렌트카 질문',
        content: '어디가 좋나요?',
      }),
    ).toMatchObject({
      category: 'qna',
      title: '제주도 렌트카 질문',
      contentText: '어디가 좋나요?',
    });
  });
});
