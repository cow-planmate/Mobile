import axios from 'axios';
import { applyChatbotPlan, askChatbot } from '../chatbot';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const askParams = {
  message: '첫째 날 동선을 더 짧게 정리해 줘',
  pendingContext: null,
  shownPlaces: [],
  recentMessages: [],
};

describe('askChatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.post as jest.Mock).mockResolvedValue({ data: {} });
  });

  // AI가 답을 만드는 데 10초 안팎이 걸린다. 전역 15초 그대로 두면 정상 응답이
  // 실패 문구로 떨어지므로, 이 호출만 따로 더 기다려야 한다.
  it('전역 15초보다 넉넉한 제한을 걸고 보낸다', async () => {
    await askChatbot('plan-1', askParams);

    const [, , config] = (mockedAxios.post as jest.Mock).mock.calls[0];
    expect(config.timeout).toBeGreaterThan(15000);
  });

  it('취소 신호를 그대로 넘긴다', async () => {
    const controller = new AbortController();

    await askChatbot('plan-1', askParams, controller.signal);

    const [, , config] = (mockedAxios.post as jest.Mock).mock.calls[0];
    expect(config.signal).toBe(controller.signal);
  });
});

describe('applyChatbotPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.post as jest.Mock).mockResolvedValue({ data: {} });
  });

  // 반영은 AI를 거치지 않는 저장이라 전역 제한으로 충분하다. 오래 매달리면
  // 저장됐는지 모르는 채로 기다리게 되므로 일부러 늘리지 않는다.
  it('제한을 따로 늘리지 않는다', async () => {
    await applyChatbotPlan('plan-1', {});

    const [, , config] = (mockedAxios.post as jest.Mock).mock.calls[0];
    expect(config?.timeout).toBeUndefined();
  });
});
