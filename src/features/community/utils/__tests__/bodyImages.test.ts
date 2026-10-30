import {
  collectImageUrls,
  createBodyImageTracker,
  uploadBodyImages,
} from '../bodyImages';

const asset = (name: string, overrides: object = {}) => ({
  uri: `file:///${name}`,
  type: 'image/jpeg',
  fileName: name,
  fileSize: 1000,
  ...overrides,
});

describe('uploadBodyImages', () => {
  it('고른 순서대로 올라간 주소를 돌려준다', async () => {
    const upload = jest.fn(async (file: { name: string }) => `https://cdn/${file.name}`);

    const result = await uploadBodyImages([asset('a.jpg'), asset('b.jpg')], upload);

    expect(result).toEqual({ urls: ['https://cdn/a.jpg', 'https://cdn/b.jpg'] });
  });

  it('한 장이라도 형식이 맞지 않으면 아무것도 올리지 않는다', async () => {
    const upload = jest.fn();

    const result = await uploadBodyImages(
      [asset('a.jpg'), asset('b.bmp', { type: 'image/bmp' })],
      upload,
    );

    expect(upload).not.toHaveBeenCalled();
    expect(result.urls).toEqual([]);
    expect(result.error).toContain('JPG, PNG, GIF, WebP');
  });

  it('5MB를 넘는 사진은 거절한다', async () => {
    const upload = jest.fn();

    const result = await uploadBodyImages(
      [asset('big.jpg', { fileSize: 6 * 1024 * 1024 })],
      upload,
    );

    expect(upload).not.toHaveBeenCalled();
    expect(result.error).toContain('5MB');
  });

  it('일부만 실패하면 올라간 사진은 살리고 실패한 장수를 알린다', async () => {
    const upload = jest.fn(async (file: { name: string }) => {
      if (file.name === 'b.jpg') throw new Error('fail');
      return `https://cdn/${file.name}`;
    });

    const result = await uploadBodyImages(
      [asset('a.jpg'), asset('b.jpg'), asset('c.jpg')],
      upload,
    );

    expect(result.urls).toEqual(['https://cdn/a.jpg', 'https://cdn/c.jpg']);
    expect(result.error).toContain('사진 1장을 올리지 못했어요.');
  });

  it('전부 실패하면 장수 없이 이유만 알린다', async () => {
    const result = await uploadBodyImages(
      [asset('a.jpg')],
      jest.fn().mockRejectedValue(new Error('fail')),
    );

    expect(result.urls).toEqual([]);
    expect(result.error).toBeTruthy();
    expect(result.error).not.toContain('장을');
  });
});

describe('collectImageUrls', () => {
  it('중첩된 블록 안의 사진까지 모은다', () => {
    expect(
      collectImageUrls([
        { type: 'paragraph' },
        { type: 'image', props: { url: 'https://cdn/a.jpg' } },
        {
          type: 'bulletListItem',
          children: [{ type: 'image', props: { url: 'https://cdn/b.jpg' } }],
        },
        { type: 'image', props: { url: '' } },
      ]),
    ).toEqual(['https://cdn/a.jpg', 'https://cdn/b.jpg']);
  });
});

describe('createBodyImageTracker', () => {
  const flush = () => new Promise(resolve => setImmediate(resolve));

  it('등록이 끝나면 본문에 남지 않은 사진만 지우고 장부를 비운다', async () => {
    const deleteImage = jest.fn().mockResolvedValue(undefined);
    const tracker = createBodyImageTracker(deleteImage);
    tracker.track('https://cdn/kept.jpg');
    tracker.track('https://cdn/removed.jpg');

    tracker.commit(['https://cdn/kept.jpg', 'https://cdn/original.jpg']);
    await flush();

    expect(deleteImage).toHaveBeenCalledTimes(1);
    expect(deleteImage).toHaveBeenCalledWith('https://cdn/removed.jpg');

    // 비워졌으므로 이어서 나가도 글에 실린 사진을 지우지 않는다.
    tracker.discardAll();
    await flush();
    expect(deleteImage).toHaveBeenCalledTimes(1);
  });

  it('등록하지 않고 나가면 올린 사진을 전부 지운다', async () => {
    const deleteImage = jest.fn().mockResolvedValue(undefined);
    const tracker = createBodyImageTracker(deleteImage);
    tracker.track('https://cdn/a.jpg');
    tracker.track('https://cdn/b.jpg');

    tracker.discardAll();
    await flush();

    expect(deleteImage.mock.calls.map(call => call[0]).sort()).toEqual([
      'https://cdn/a.jpg',
      'https://cdn/b.jpg',
    ]);
  });

  it('지우기에 실패해도 오류를 밖으로 던지지 않는다', async () => {
    const tracker = createBodyImageTracker(
      jest.fn().mockRejectedValue(new Error('network')),
    );
    tracker.track('https://cdn/a.jpg');

    expect(() => tracker.discardAll()).not.toThrow();
    await flush();
  });
});
