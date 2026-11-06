import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  ActivityRowsSkeleton,
  ProfileStoriesSkeleton,
  ProfileTravelSkeleton,
} from '../ProfileTabSkeletons';
import { SKELETON_DELAY_MS } from '../../../../components/ui';

describe('ProfileTabSkeletons', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const mount = async (element: React.ReactElement) => {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(element);
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
    ['여행 일정 탭', <ProfileTravelSkeleton />, '여행 일정을 불러오는 중'],
    [
      '커뮤니티 활동 탭',
      <ProfileStoriesSkeleton />,
      '커뮤니티 활동을 불러오는 중',
    ],
    ['활동 줄', <ActivityRowsSkeleton />, '활동을 불러오는 중'],
    [
      '댓글 줄',
      <ActivityRowsSkeleton variant="comment" />,
      '활동을 불러오는 중',
    ],
  ])(
    '%s은 라벨을 알리고 기준 시간 뒤에 뼈대를 보인다',
    async (_, el, label) => {
      await mount(el);

      const bar = renderer.root.findByProps({
        accessibilityRole: 'progressbar',
      });
      expect(bar.props.accessibilityLabel).toBe(label);
      expect(
        renderer.root.findAllByProps({ testID: 'skeleton-bones' }),
      ).toHaveLength(0);

      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(SKELETON_DELAY_MS);
      });
      expect(
        renderer.root.findAllByProps({ testID: 'skeleton-bones' }).length,
      ).toBeGreaterThan(0);
    },
  );
});
