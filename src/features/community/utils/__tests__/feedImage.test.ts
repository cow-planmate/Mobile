import { buildFeedImageUploadFile } from '../feedImage';

describe('buildFeedImageUploadFile', () => {
  it('선택한 이미지 asset을 업로드 파일로 변환한다', () => {
    expect(
      buildFeedImageUploadFile({
        uri: 'file:///feed.jpg',
        type: 'image/jpeg',
        fileName: 'feed.jpg',
        fileSize: 1024,
      }),
    ).toEqual({
      file: {
        uri: 'file:///feed.jpg',
        type: 'image/jpeg',
        name: 'feed.jpg',
      },
    });
  });

  it('5MB를 넘는 이미지를 거부한다', () => {
    expect(
      buildFeedImageUploadFile({
        uri: 'file:///large.jpg',
        type: 'image/jpeg',
        fileSize: 5 * 1024 * 1024 + 1,
      }),
    ).toEqual({ error: '이미지는 5MB 이하만 등록할 수 있어요.' });
  });
});
