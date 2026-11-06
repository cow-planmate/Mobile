import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ProfileSkeleton, { SKELETON_DELAY_MS } from '../ProfileSkeleton';

describe('ProfileSkeleton', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const hasBones = () =>
    renderer.root.findAllByProps({ testID: 'profile-skeleton-bones' }).length >
    0;

  beforeEach(async () => {
    jest.useFakeTimers();
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ProfileSkeleton />);
    });
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
    jest.useRealTimers();
  });

  it('불러오는 중임을 접근성 라벨로 알린다', () => {
    const bar = renderer.root.findByProps({ accessibilityRole: 'progressbar' });
    expect(bar.props.accessibilityLabel).toBe('프로필을 불러오는 중');
  });

  it('기준 시간이 지나기 전에는 뼈대를 보이지 않는다', async () => {
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(SKELETON_DELAY_MS - 1);
    });
    expect(hasBones()).toBe(false);
  });

  it('기준 시간이 지나면 뼈대를 보인다', async () => {
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(SKELETON_DELAY_MS);
    });
    expect(hasBones()).toBe(true);
  });
});
