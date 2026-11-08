import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  DetailSkeleton,
  FeedListSkeleton,
  PostListSkeleton,
} from '../CommunitySkeletons';
import { SKELETON_DELAY_MS } from '../../../../components/ui';

describe('CommunitySkeletons', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const mount = async (element: React.ReactElement) => {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(element);
    });
  };
  const hasBones = () =>
    renderer.root.findAllByProps({ testID: 'skeleton-bones' }).length > 0;
  const labelOf = () =>
    renderer.root.findByProps({ accessibilityRole: 'progressbar' }).props
      .accessibilityLabel;
  const waitDelay = async () => {
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(SKELETON_DELAY_MS);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
    jest.useRealTimers();
  });

  it.each([
    ['게시판 목록', <PostListSkeleton />, '게시글을 불러오는 중'],
    ['여행기 목록', <FeedListSkeleton />, '여행기를 불러오는 중'],
    ['여행기 목록 격자', <FeedListSkeleton isGrid />, '여행기를 불러오는 중'],
    [
      '상세',
      <DetailSkeleton label="게시글을 불러오는 중" />,
      '게시글을 불러오는 중',
    ],
  ])(
    '%s은 라벨을 알리고 기준 시간 뒤에 뼈대를 보인다',
    async (_, el, label) => {
      await mount(el);

      expect(labelOf()).toBe(label);
      expect(hasBones()).toBe(false);

      await waitDelay();
      expect(hasBones()).toBe(true);
    },
  );
});
