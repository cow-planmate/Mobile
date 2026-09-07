import { buildFeedUpdatePayload } from '../feedPostPayload';

describe('buildFeedUpdatePayload', () => {
  it('제목과 본문의 앞뒤 공백을 털어내고 썸네일을 함께 보낸다', () => {
    const payload = buildFeedUpdatePayload({
      title: '  제주 3박 4일  ',
      content: '  뚜벅이로 다녀왔어요  ',
      thumbnailUrl: '  https://cdn.example.com/a.jpg  ',
    });

    expect(payload).toMatchObject({
      title: '제주 3박 4일',
      contentText: '뚜벅이로 다녀왔어요',
      thumbnailUrl: 'https://cdn.example.com/a.jpg',
    });
  });

  it('본문이 비면 제목을 본문으로 쓴다', () => {
    expect(
      buildFeedUpdatePayload({
        title: '제주 3박 4일',
        content: '   ',
        thumbnailUrl: '',
      }).contentText,
    ).toBe('제주 3박 4일');
  });

  it('썸네일이 비면 null을 보낸다', () => {
    expect(
      buildFeedUpdatePayload({
        title: '제목',
        content: '본문',
        thumbnailUrl: '   ',
      }).thumbnailUrl,
    ).toBeNull();
  });

  // 태그 입력은 웹이 먼저 없앴고 앱도 걷어냈다 — 페이로드에 다시 실리면 안 된다.
  it('태그는 더 이상 보내지 않는다', () => {
    expect(
      buildFeedUpdatePayload({
        title: '제목',
        content: '본문',
        thumbnailUrl: '',
      }),
    ).not.toHaveProperty('tags');
  });
});
