import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Image, Text, TouchableOpacity } from 'react-native';
import ChatbotWindow from '../ChatbotWindow';
import { applyChatbotPlan, askChatbot } from '../../../../../api/chatbot';

jest.mock('../../../../../api/chatbot', () => {
  const actual = jest.requireActual('../../../../../api/chatbot');
  return {
    ...actual,
    askChatbot: jest.fn(),
    applyChatbotPlan: jest.fn(),
  };
});

const mockAsk = askChatbot as jest.Mock;
const mockApply = applyChatbotPlan as jest.Mock;

const texts = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root
    .findAllByType(Text)
    .flatMap(node => {
      const children = node.props.children;
      return Array.isArray(children) ? children : [children];
    })
    .filter(child => typeof child === 'string' || typeof child === 'number')
    .map(String);

const pressLabel = async (tree: renderer.ReactTestRenderer, label: string) => {
  await act(async () => {
    await tree.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onPress();
  });
};

const render = (planId: string | null = 'plan-1') => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <ChatbotWindow visible planId={planId} onClose={() => {}} />,
    );
  });
  return tree;
};

const samplePlan = {
  planFrame: { planName: '제주 2박 3일' },
  timetables: [{}, {}, {}],
  placeBlocks: [
    {
      blockId: 1,
      blockStartTime: '09:00:00',
      blockEndTime: '10:30:00',
      placeName: '성산일출봉',
    },
  ],
};

describe('AI 여행 도우미', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsk.mockResolvedValue({ userMessage: '이렇게 바꿔볼까요?' });
    mockApply.mockResolvedValue({});
  });

  it('일정을 저장하기 전에는 쓸 수 없다고 알린다', () => {
    const tree = render(null);

    expect(texts(tree)).toContain('저장된 일정에서 사용할 수 있어요');
    // 보낼 곳이 없으므로 입력도 막는다.
    expect(mockAsk).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('권하는 말을 누르면 그대로 보내고 답을 붙인다', async () => {
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');

    expect(mockAsk).toHaveBeenCalledWith(
      'plan-1',
      expect.objectContaining({ message: '근처 맛집을 몇 곳 추천해 줘' }),
    );
    const shown = texts(tree);
    expect(shown).toContain('근처 맛집을 몇 곳 추천해 줘');
    expect(shown).toContain('이렇게 바꿔볼까요?');
    act(() => tree.unmount());
  });

  it('제안은 반영을 눌러야 일정에 들어간다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '이렇게 바꿔볼까요?',
      plan: samplePlan,
    });
    const onApplied = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ChatbotWindow
          visible
          planId="plan-1"
          onClose={() => {}}
          onApplied={onApplied}
        />,
      );
    });

    await pressLabel(tree, '첫째 날 동선을 더 짧게 정리해 줘');

    // 받은 것만으로는 아무것도 바뀌지 않는다.
    expect(texts(tree)).toContain('아직 미반영');
    expect(mockApply).not.toHaveBeenCalled();

    await pressLabel(tree, '이 일정에 반영');

    expect(mockApply).toHaveBeenCalledWith('plan-1', samplePlan);
    expect(onApplied).toHaveBeenCalledTimes(1);
    expect(texts(tree)).toContain('일정 반영이 완료됐어요.');
    act(() => tree.unmount());
  });

  it('제안 취소는 서버를 부르지 않고 미리보기만 걷는다', async () => {
    mockAsk.mockResolvedValue({ userMessage: '이렇게요', plan: samplePlan });
    const tree = render();

    await pressLabel(tree, '첫째 날 동선을 더 짧게 정리해 줘');
    await pressLabel(tree, '제안 취소');

    expect(mockApply).not.toHaveBeenCalled();
    expect(texts(tree)).not.toContain('아직 미반영');
    expect(texts(tree)).toContain(
      '변경 제안을 취소했어요. 현재 저장된 일정은 그대로예요.',
    );
    act(() => tree.unmount());
  });

  it('실패하면 대화 안에 사람 말로 남긴다', async () => {
    mockAsk.mockRejectedValue({ response: { status: 404 } });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');

    expect(texts(tree)).toContain(
      'AI 도우미가 아직 연결되지 않았어요. 잠시 뒤에 다시 시도해 주세요.',
    );
    act(() => tree.unmount());
  });

  it('추천 장소 그림을 못 불러오면 빈 칸 대신 대체 그림을 세운다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '이런 곳은 어때요?',
      shownPlaces: [
        {
          contentId: '1',
          title: '토담순두부',
          category: 'RESTAURANT',
          thumbnailUrl: 'https://example.test/broken.jpg',
        },
      ],
    });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');
    const thumb = tree.root.findAllByType(Image)[0];
    expect(thumb.props.source).toEqual({
      uri: 'https://example.test/broken.jpg',
    });

    await act(async () => thumb.props.onError());

    // 그림이 사라진 자리에 흰 칸만 남으면 안 된다.
    expect(tree.root.findAllByType(Image)).toHaveLength(0);
    expect(texts(tree)).toContain('토담순두부');
    act(() => tree.unmount());
  });

  it('반영한 뒤에는 되돌리기로 취소되지 않는다고 알린다', async () => {
    mockAsk.mockResolvedValue({ userMessage: '이렇게요', plan: samplePlan });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');
    await pressLabel(tree, '이 일정에 반영');

    expect(texts(tree)).toContain(
      '제안한 내용을 일정에 반영했어요. 되돌리기로는 취소되지 않으니, 되돌리려면 시간표에서 해당 장소를 지워 주세요.',
    );
    act(() => tree.unmount());
  });

  it('새 대화를 누르면 제안과 주고받은 말을 모두 버린다', async () => {
    mockAsk.mockResolvedValue({ userMessage: '이렇게요', plan: samplePlan });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');
    expect(texts(tree)).toContain('아직 미반영');

    await pressLabel(tree, '새 대화 시작');

    const shown = texts(tree);
    expect(shown).not.toContain('아직 미반영');
    expect(shown).not.toContain('이렇게요');
    // 처음으로 돌아갔으므로 인사와 권하는 말이 다시 보인다.
    expect(shown).toContain(
      '일정을 어떻게 바꿔볼까요? 장소 추천부터 순서 조정까지 편하게 말해 주세요.',
    );
    act(() => tree.unmount());
  });
});
