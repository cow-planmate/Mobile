import React from 'react';
import renderer, { act } from 'react-test-renderer';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  USER_PROFILE_QUERY_KEY,
  useUserProfile,
} from '../useUserProfile';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useUserProfile', () => {
  it('일정 날짜 보강 중 구독이 끝나면 취소를 정상 응답으로 바꾸지 않는다', async () => {
    let notifyDetailStarted: (() => void) | undefined;
    const detailStarted = new Promise<void>(resolve => {
      notifyDetailStarted = resolve;
    });
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          nickname: '사용자',
          myPlans: [{ planId: 'plan-1', planName: '여행' }],
          editablePlans: [],
        },
      })
      .mockImplementationOnce((_url, config) => {
        notifyDetailStarted?.();
        return new Promise((resolveDetail, reject) => {
          void resolveDetail;
          config?.signal?.addEventListener?.('abort', () => {
            reject(new Error('canceled'));
          });
        });
      });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Probe = () => {
      useUserProfile();
      return null;
    };

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <QueryClientProvider client={queryClient}>
          <Probe />
        </QueryClientProvider>,
      );
    });
    await act(async () => {
      await detailStarted;
    });

    act(() => tree!.unmount());
    await act(async () => {
      await Promise.resolve();
    });

    expect(queryClient.getQueryData(USER_PROFILE_QUERY_KEY)).toBeUndefined();
    expect(mockedAxios.get.mock.calls[1][1]?.signal?.aborted).toBe(true);
    queryClient.clear();
  });
});
