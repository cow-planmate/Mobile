import React from 'react';
import { Linking, Platform } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import InAppUpdates from 'sp-react-native-in-app-updates';
import { useInAppUpdate } from '../useInAppUpdate';

let latest: ReturnType<typeof useInAppUpdate>;
const Probe = () => {
  latest = useInAppUpdate();
  return null;
};

const mount = async () => {
  let tree: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<Probe />);
  });
  return tree!;
};

const mockInstance = (overrides: Record<string, unknown> = {}) => {
  const instance = {
    checkNeedsUpdate: jest.fn(() => Promise.resolve({ shouldUpdate: false })),
    startUpdate: jest.fn(() => Promise.resolve()),
    installUpdate: jest.fn(),
    ...overrides,
  };
  (InAppUpdates as unknown as jest.Mock).mockImplementationOnce(() => instance);
  return instance;
};

describe('useInAppUpdate', () => {
  const originalOS = Platform.OS;
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
  });
  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it('안드로이드가 아니면 확인하지 않는다', async () => {
    Platform.OS = 'ios';
    const tree = await mount();
    expect(InAppUpdates).not.toHaveBeenCalled();
    expect(latest.updateRequired).toBe(false);
    act(() => tree.unmount());
  });

  it('새 버전이 있으면 즉시형으로 시작하고 앱을 막는다', async () => {
    const instance = mockInstance({
      checkNeedsUpdate: jest.fn(() => Promise.resolve({ shouldUpdate: true })),
    });
    const tree = await mount();
    expect(instance.startUpdate).toHaveBeenCalledWith({ updateType: 1 });
    expect(latest.updateRequired).toBe(true);
    act(() => tree.unmount());
  });

  it('새 버전이 없으면 막지 않는다', async () => {
    const instance = mockInstance();
    const tree = await mount();
    expect(instance.startUpdate).not.toHaveBeenCalled();
    expect(latest.updateRequired).toBe(false);
    act(() => tree.unmount());
  });

  it('업데이트 창을 닫아도 막힌 채로 두고, 다시 누르면 다시 시작한다', async () => {
    const instance = mockInstance({
      checkNeedsUpdate: jest.fn(() => Promise.resolve({ shouldUpdate: true })),
    });
    const tree = await mount();
    expect(instance.startUpdate).toHaveBeenCalledTimes(1);
    await act(async () => {
      await latest.retry();
    });
    expect(latest.updateRequired).toBe(true);
    expect(instance.startUpdate).toHaveBeenCalledTimes(2);
    act(() => tree.unmount());
  });

  it('즉시 업데이트를 시작하지 못하면 스토어 페이지로 보낸다', async () => {
    mockInstance({
      checkNeedsUpdate: jest.fn(() => Promise.resolve({ shouldUpdate: true })),
      startUpdate: jest.fn(() => Promise.reject(new Error('not allowed'))),
    });
    const tree = await mount();
    expect(Linking.openURL).toHaveBeenCalledWith(
      'market://details?id=com.planmate.planmate',
    );
    act(() => tree.unmount());
  });

  it('확인이 실패하면 막지 않는다', async () => {
    mockInstance({
      checkNeedsUpdate: jest.fn(() => Promise.reject(new Error('offline'))),
    });
    const tree = await mount();
    expect(latest.updateRequired).toBe(false);
    act(() => tree.unmount());
  });
});
