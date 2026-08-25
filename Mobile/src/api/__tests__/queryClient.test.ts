import { queryClient } from '../queryClient';

const retry = queryClient.getDefaultOptions().queries?.retry as (
  failureCount: number,
  error: unknown,
) => boolean;

const axiosError = (status?: number) => ({
  isAxiosError: true,
  response: status === undefined ? undefined : { status },
});

describe('queryClient retry', () => {
  it.each([400, 401, 403, 404])('%s 응답은 재시도하지 않는다', status => {
    expect(retry(0, axiosError(status))).toBe(false);
  });

  it.each([408, 429, 500, 503])('%s 응답은 한 번 재시도한다', status => {
    expect(retry(0, axiosError(status))).toBe(true);
    expect(retry(1, axiosError(status))).toBe(false);
  });

  it('응답이 없는 네트워크 오류는 한 번 재시도한다', () => {
    expect(retry(0, axiosError())).toBe(true);
  });

  it('Axios 오류가 아닌 실행 오류는 재시도하지 않는다', () => {
    expect(retry(0, new Error('invalid response'))).toBe(false);
  });
});
