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

/** 입력창에 적어 보낸다. 권하는 말 단추는 첫 마디에만 뜨므로 두 번째부터는 이 길이다. */
const sendTyped = async (tree: renderer.ReactTestRenderer, text: string) => {
  await act(async () => {
    tree.root
      .findByProps({ accessibilityLabel: 'AI 도우미에게 보낼 말' })
      .props.onChangeText(text);
  });
  await act(async () => {
    await tree.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.accessibilityLabel === '메시지 보내기')!
      .props.onPress();
  });
};

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

  it('미리보기에 바뀌는 장소를 하나도 숨기지 않는다', async () => {
    const block = (hour: number, name: string, date: string) => ({
      blockId: `${date}-${hour}`,
      date,
      blockStartTime: `${String(hour).padStart(2, '0')}:00:00`,
      blockEndTime: `${String(hour + 1).padStart(2, '0')}:00:00`,
      placeName: name,
    });
    mockAsk.mockResolvedValue({
      userMessage: '이렇게 바꿔볼까요?',
      plan: {
        planFrame: { planName: '제주 2박 3일' },
        timetables: [{}, {}],
        placeBlocks: [
          block(9, '성산일출봉', '2026-09-20'),
          block(11, '섭지코지', '2026-09-20'),
          block(14, '우도', '2026-09-20'),
          block(17, '흑돼지 거리', '2026-09-20'),
          block(9, '한라산', '2026-09-21'),
        ],
      },
    });
    const tree = render();

    await pressLabel(tree, '첫째 날 동선을 더 짧게 정리해 줘');

    const shown = texts(tree);
    // 앞의 셋만 보여 주면 미리보기가 아니다.
    ['성산일출봉', '섭지코지', '우도', '흑돼지 거리', '한라산'].forEach(name =>
      expect(shown).toContain(name),
    );
    expect(shown.some(text => text.startsWith('외 '))).toBe(false);
    // 이틀치가 섞이면 같은 시각이 두 번 나온다 - 며칠차인지 앞에 단다.
    expect(shown).toContain('1일차 · 09.20');
    expect(shown).toContain('2일차 · 09.21');
    act(() => tree.unmount());
  });

  it('추천 카드에는 주소 대신 어떤 곳인지를 적는다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '이런 곳은 어때요?',
      shownPlaces: [
        {
          contentId: '1',
          title: '전주콩나물해장국',
          category: 'RESTAURANT',
          addr1: '서울특별시 종로구 자하문로 3',
          overview:
            '전주콩나물해장국은 따뜻한 뚝배기에 담겨 나오는 콩나물 국밥 전문점이다.',
          firstMenu: '콩나물국밥',
          openTime: '06:00~20:30',
        },
        // 소개가 없으면 갈래별 대표 한 줄로 메운다.
        {
          contentId: '2',
          title: '서촌계단집',
          category: 'RESTAURANT',
          addr1: '서울특별시 종로구 자하문로1길',
          firstMenu: '돼지갈비',
          openTime: '16:00~23:00',
        },
        // 둘 다 없을 때만 주소가 남는다.
        {
          contentId: '3',
          title: '이름만 아는 집',
          category: 'RESTAURANT',
          addr1: '서울특별시 종로구 사직로',
        },
      ],
    });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');

    const shown = texts(tree);
    // 바로 윗줄에 이름이 있다 - 소개가 제 이름으로 시작하면 그만큼 떼어 낸다.
    expect(shown).toContain('따뜻한 뚝배기에 담겨 나오는 콩나물 국밥 전문점이다.');
    // 소개가 있는 곳에 주소를 겹쳐 적지 않는다.
    expect(shown).not.toContain('서울특별시 종로구 자하문로 3');
    expect(shown).toContain('돼지갈비 · 16:00~23:00');
    expect(shown).toContain('서울특별시 종로구 사직로');
    act(() => tree.unmount());
  });

  it('서버가 별표로 강조한 자리는 굵은 글씨로 그린다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '**봉래면옥**을 첫째 날에 넣어 두었어요.',
    });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');

    const shown = texts(tree);
    // 별표가 글자로 보이면 안 된다.
    expect(shown.some(text => text.includes('**'))).toBe(false);
    expect(shown).toContain('봉래면옥');

    const strong = tree.root
      .findAllByType(Text)
      .find(node => node.props.children === '봉래면옥')!;
    const style = Array.isArray(strong.props.style)
      ? Object.assign({}, ...strong.props.style)
      : strong.props.style;
    expect(style.fontFamily).toBe('Pretendard-Bold');
    act(() => tree.unmount());
  });

  it('이름이 가운데 나오는 소개는 그대로 둔다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '이런 곳은 어때요?',
      shownPlaces: [
        {
          contentId: '1',
          title: '모던샤브하우스',
          category: 'RESTAURANT',
          overview: '종로구에 위치한 모던샤브하우스는 육수를 고를 수 있다.',
        },
      ],
    });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');

    // 앞에서 잘라 내면 말이 끊긴다. 맨 앞에 있을 때만 뗀다.
    expect(texts(tree)).toContain(
      '종로구에 위치한 모던샤브하우스는 육수를 고를 수 있다.',
    );
    act(() => tree.unmount());
  });

  it('반영한 제안도 대화에 그대로 남는다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '이렇게 바꿔볼까요?',
      plan: samplePlan,
    });
    const tree = render();

    await pressLabel(tree, '첫째 날 동선을 더 짧게 정리해 줘');
    await pressLabel(tree, '이 일정에 반영');

    const shown = texts(tree);
    // 무엇을 반영했는지가 대화에 남아야 나중에 일정이 왜 이렇게 됐는지 읽힌다.
    expect(shown).toContain('성산일출봉');
    expect(shown).toContain('일정에 반영함');
    expect(shown).not.toContain('아직 미반영');
    // 이미 반영한 것을 또 반영할 수는 없다.
    expect(
      tree.root
        .findAllByType(TouchableOpacity)
        .some(node => node.props.accessibilityLabel === '이 일정에 반영'),
    ).toBe(false);
    act(() => tree.unmount());
  });

  it('새 제안이 오면 앞의 제안은 무엇에 이어졌는지만 남는다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '이렇게 바꿔볼까요?',
      plan: samplePlan,
    });
    const tree = render();

    await pressLabel(tree, '첫째 날 동선을 더 짧게 정리해 줘');
    mockAsk.mockResolvedValue({
      userMessage: '다시 짜봤어요.',
      plan: {
        ...samplePlan,
        placeBlocks: [
          {
            blockId: 2,
            blockStartTime: '13:00:00',
            blockEndTime: '14:00:00',
            placeName: '우도',
          },
        ],
      },
    });
    await sendTyped(tree, '다시 짜 줘');

    const shown = texts(tree);
    // 앞의 제안을 지우지 않는다 - 무엇을 거쳐 여기까지 왔는지가 기록이다.
    expect(shown).toContain('성산일출봉');
    expect(shown).toContain('우도');
    expect(shown).toContain('다음 제안으로 이어짐');
    // 누를 수 있는 것은 마지막 제안 하나뿐이다.
    expect(
      tree.root
        .findAllByType(TouchableOpacity)
        .filter(node => node.props.accessibilityLabel === '이 일정에 반영'),
    ).toHaveLength(1);
    act(() => tree.unmount());
  });

  it('제안 취소는 서버를 부르지 않고 미리보기만 걷는다', async () => {
    mockAsk.mockResolvedValue({ userMessage: '이렇게요', plan: samplePlan });
    const tree = render();

    await pressLabel(tree, '첫째 날 동선을 더 짧게 정리해 줘');
    await pressLabel(tree, '제안 취소');

    expect(mockApply).not.toHaveBeenCalled();
    expect(texts(tree)).not.toContain('아직 미반영');
    // 걷어 내는 것은 단추뿐이다 - 무엇을 받았다 취소했는지는 남는다.
    expect(texts(tree)).toContain('취소함');
    expect(texts(tree)).toContain('성산일출봉');
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

  it('이름이 나온 줄 바로 아래에 그 장소 카드를 세운다', async () => {
    mockAsk.mockResolvedValue({
      userMessage:
        '속초의 인기 맛집 2곳을 추천해 드립니다:\n' +
        '1. 진솔할머니순두부 (초당순두부, 순두부 전골)\n' +
        '2. 청초수물회 (사골육수 해전물회)\n' +
        '마음에 드는 곳이 있으면 말씀해 주세요!',
      shownPlaces: [
        {
          contentId: '1',
          title: '진솔할머니순두부',
          category: 'RESTAURANT',
          addr1: '속초시 원암동',
        },
        {
          contentId: '2',
          title: '청초수물회',
          category: 'RESTAURANT',
          addr1: '속초시 조양동',
        },
      ],
    });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');

    const shown = texts(tree);
    // 읊어 준 줄은 그대로 남는다 - 몇 번째로 권한 곳인지가 거기 적혀 있다.
    expect(shown).toContain(
      '속초의 인기 맛집 2곳을 추천해 드립니다:\n1. 진솔할머니순두부 (초당순두부, 순두부 전골)',
    );
    // 그 줄 다음에 그 장소의 카드가 온다.
    const firstLine = shown.findIndex(text =>
      text.includes('1. 진솔할머니순두부'),
    );
    const firstCard = shown.indexOf('속초시 원암동');
    const secondLine = shown.findIndex(text => text.includes('2. 청초수물회'));
    const secondCard = shown.indexOf('속초시 조양동');
    expect(firstLine).toBeGreaterThanOrEqual(0);
    expect(firstCard).toBeGreaterThan(firstLine);
    expect(secondLine).toBeGreaterThan(firstCard);
    expect(secondCard).toBeGreaterThan(secondLine);
    // 마무리 설명은 마지막 카드 뒤에 남는다.
    expect(
      shown.findIndex(text => text.includes('마음에 드는 곳이 있으면')),
    ).toBeGreaterThan(secondCard);
    act(() => tree.unmount());
  });

  it('글에서 이름을 못 찾은 장소도 카드로는 세운다', async () => {
    mockAsk.mockResolvedValue({
      userMessage: '이런 곳은 어때요?',
      shownPlaces: [
        {
          contentId: '9',
          title: '토담순두부',
          category: 'RESTAURANT',
          addr1: '속초시 교동',
        },
      ],
    });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');

    const shown = texts(tree);
    // 글은 그대로 두고, 카드만 맨 뒤에 붙는다.
    expect(shown).toContain('이런 곳은 어때요?');
    expect(shown.indexOf('토담순두부')).toBeGreaterThan(
      shown.indexOf('이런 곳은 어때요?'),
    );
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

  it('닫았다 다시 열어도 주고받은 말이 남아 있다', async () => {
    mockAsk.mockResolvedValue({ userMessage: '이렇게요', plan: samplePlan });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');
    expect(texts(tree)).toContain('이렇게요');

    // 닫으면 그리지 않을 뿐 창은 그대로 붙어 있다.
    act(() => {
      tree.update(
        <ChatbotWindow visible={false} planId="plan-1" onClose={() => {}} />,
      );
    });
    expect(texts(tree)).toEqual([]);

    act(() => {
      tree.update(<ChatbotWindow visible planId="plan-1" onClose={() => {}} />);
    });

    const shown = texts(tree);
    expect(shown).toContain('이렇게요');
    expect(shown).toContain('아직 미반영');
    act(() => tree.unmount());
  });

  it('다른 일정을 열면 앞의 대화는 비운다', async () => {
    mockAsk.mockResolvedValue({ userMessage: '이렇게요', plan: samplePlan });
    const tree = render();

    await pressLabel(tree, '근처 맛집을 몇 곳 추천해 줘');
    expect(texts(tree)).toContain('이렇게요');

    act(() => {
      tree.update(<ChatbotWindow visible planId="plan-2" onClose={() => {}} />);
    });

    const shown = texts(tree);
    expect(shown).not.toContain('이렇게요');
    expect(shown).toContain(
      '일정을 어떻게 바꿔볼까요? 장소 추천부터 순서 조정까지 편하게 말해 주세요.',
    );
    act(() => tree.unmount());
  });
});
