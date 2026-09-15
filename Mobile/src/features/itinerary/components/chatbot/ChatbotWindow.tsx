import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import Bot from 'lucide-react-native/dist/esm/icons/bot';
import CalendarDays from 'lucide-react-native/dist/esm/icons/calendar-days';
import Check from 'lucide-react-native/dist/esm/icons/check';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import Clock3 from 'lucide-react-native/dist/esm/icons/clock-3';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import Send from 'lucide-react-native/dist/esm/icons/send';
import Sparkles from 'lucide-react-native/dist/esm/icons/sparkles';
import X from 'lucide-react-native/dist/esm/icons/x';
import { normalize } from '../../../../utils/normalize';
import {
  applyChatbotPlan,
  askChatbot,
  CHATBOT_MESSAGE_MAX_LENGTH,
  ChatbotPlace,
  ChatbotPlan,
  ChatbotPlanBlock,
  getChatbotErrorMessage,
} from '../../../../api/chatbot';
import {
  COLORS,
  styles,
  WINDOW_BOTTOM,
  WINDOW_TOP,
} from './ChatbotWindow.styles';

const WELCOME =
  '일정을 어떻게 바꿔볼까요? 장소 추천부터 순서 조정까지 편하게 말해 주세요.';

const QUICK_PROMPTS = [
  '첫째 날 동선을 더 짧게 정리해 줘',
  '근처 맛집을 몇 곳 추천해 줘',
  '비 오는 날 가기 좋은 장소를 알려 줘',
];

const CATEGORY_LABELS: Record<string, string> = {
  ATTRACTION: '관광지',
  ACCOMMODATION: '숙소',
  RESTAURANT: '식당',
  FREE: '직접 추가',
  SEARCH: '검색 장소',
};

type NoticeType = 'success' | 'warning' | 'error' | 'neutral';

interface Notice {
  type: NoticeType;
  text: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** 말한 시각. 첫 인사에는 붙이지 않는다. */
  at?: string;
  /** 이 말과 함께 온 추천 장소. 글 대신 카드로 세운다. */
  places?: ChatbotPlace[];
}

type Segment =
  | { kind: 'text'; key: string; text: string }
  | { kind: 'place'; key: string; place: ChatbotPlace };

/**
 * 답을 글 토막과 장소 카드로 갈라 놓는다.
 *
 * 서버는 '1. 진솔할머니순두부 (초당순두부)'처럼 번호를 매겨 읊어 준다. 카드를
 * 말끝에 몰아 세우면 몇 번째로 권한 곳인지, 어떤 설명에 딸린 곳인지가 끊긴다.
 * 이름이 나온 줄 바로 아래에 그 카드를 세워 읽던 자리에서 같이 보이게 한다.
 *
 * 글에서 못 찾은 장소는 맨 끝에 붙인다 - 서버가 이름을 달리 적어 보내도
 * 카드가 통째로 사라지지는 않는다.
 */
const toSegments = (text: string, places?: ChatbotPlace[]): Segment[] => {
  const list = places ?? [];
  if (list.length === 0) return [{ kind: 'text', key: 'text-0', text }];

  const keys = list.map(place => (place.title ?? '').replace(/\s+/g, ''));
  const used = new Set<number>();
  const segments: Segment[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const joined = buffer.join('\n').trim();
    buffer = [];
    if (joined)
      segments.push({
        kind: 'text',
        key: `text-${segments.length}`,
        text: joined,
      });
  };

  text.split(/\r?\n/).forEach(line => {
    buffer.push(line);
    const squashed = line.replace(/\s+/g, '');
    const hit = keys.findIndex(
      (key, index) => !!key && !used.has(index) && squashed.includes(key),
    );
    if (hit < 0) return;
    used.add(hit);
    flush();
    segments.push({
      kind: 'place',
      key: `place-${list[hit].contentId ?? hit}`,
      place: list[hit],
    });
  });
  flush();

  list.forEach((place, index) => {
    if (used.has(index)) return;
    segments.push({
      kind: 'place',
      key: `place-${place.contentId ?? index}-rest`,
      place,
    });
  });

  return segments;
};

const NOTICE_TONE: Record<
  NoticeType,
  { bg: string; border: string; fg: string }
> = {
  success: { bg: '#F0FDF4', border: '#BBF7D0', fg: '#15803D' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', fg: '#B45309' },
  error: { bg: '#FEF2F2', border: '#FECACA', fg: '#DC2626' },
  neutral: {
    bg: COLORS.surface,
    border: COLORS.border,
    fg: COLORS.textSecondary,
  },
};

let messageSeq = 0;
const nextMessageId = () => `m${(messageSeq += 1)}`;

const stampNow = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const welcomeMessage = (): Message => ({
  id: nextMessageId(),
  role: 'assistant',
  text: WELCOME,
});

/**
 * 추천 장소 썸네일.
 *
 * 그림 주소가 없을 때만 대체 그림을 두면, 주소는 있는데 불러오기에 실패한
 * 경우 흰 칸만 남는다. 실패도 주소가 없을 때와 같은 자리로 되돌린다.
 */
function PlaceThumb({ uri }: { uri?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[styles.placeThumb, styles.placeThumbEmpty]}>
        <MapPin size={normalize(18)} color={COLORS.borderStrong} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.placeThumb}
      onError={() => setFailed(true)}
    />
  );
}

const planName = (plan: ChatbotPlan) =>
  plan.planFrame?.planName ?? plan.planFrame?.name ?? '일정 변경 제안';

const blockTime = (block: ChatbotPlanBlock) => {
  const start = block.blockStartTime?.slice(0, 5);
  const end = block.blockEndTime?.slice(0, 5);
  if (start && end) return `${start}–${end}`;
  return start ?? '시간 미정';
};

interface ChatbotWindowProps {
  visible: boolean;
  onClose: () => void;
  planId: string | null;
  /** 반영이 끝나면 시간표를 다시 받아 와야 한다. */
  onApplied?: () => void;
}

/**
 * AI 여행 도우미.
 *
 * 웹 ChatBot과 같은 떠 있는 창이다 - 화면을 덮지 않으므로 창 옆으로 시간표가
 * 계속 보이고, 제안과 실제 일정을 같이 놓고 볼 수 있다. 닫기는 편집 화면의
 * 진입 단추가 맡는다(웹과 같은 토글).
 *
 * 제안은 받자마자 저장하지 않는다. 같이 편집하는 사람의 화면도 함께 바뀌므로,
 * 무엇이 바뀌는지 먼저 보여 주고 반영을 눌러야 서버로 보낸다.
 */
export default function ChatbotWindow({
  visible,
  onClose,
  planId,
  onApplied,
}: ChatbotWindowProps) {
  const canUse = !!planId && planId !== '-1' && planId !== '0';

  const [messages, setMessages] = useState<Message[]>(() => [welcomeMessage()]);
  const [input, setInput] = useState('');
  const [isSending, setSending] = useState(false);
  const [isApplying, setApplying] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ChatbotPlan | null>(null);
  const [shownPlaces, setShownPlaces] = useState<ChatbotPlace[]>([]);
  const [recentMessages, setRecentMessages] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  /** 다른 일정으로 옮겨 갈 때만 비운다. 손으로 비우는 자리는 두지 않는다. */
  const reset = useCallback(() => {
    setMessages([welcomeMessage()]);
    setInput('');
    setPendingPlan(null);
    setShownPlaces([]);
    setRecentMessages([]);
    setNotice(null);
  }, []);

  // 다른 일정을 열면 앞의 대화는 그 일정 이야기라 이어 붙이면 안 된다.
  useEffect(() => {
    reset();
  }, [planId, reset]);

  // 창은 화면을 덮지 않으므로 뒤로가기가 편집 화면까지 닿는다. 열려 있는 동안은
  // 창부터 닫는다 - 뒤로가기를 눌러 화면이 통째로 빠지면 대화가 사라진다.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  // 안드로이드는 adjustResize로 화면 자체가 줄어 창이 알아서 올라간다.
  // iOS는 줄지 않으므로 자판 높이만큼 직접 올린다.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const show = Keyboard.addListener('keyboardWillShow', event =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardWillHide', () =>
      setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const appendBot = useCallback((text: string, places?: ChatbotPlace[]) => {
    setMessages(current => [
      ...current,
      {
        id: nextMessageId(),
        role: 'assistant',
        text,
        at: stampNow(),
        places: places?.length ? places : undefined,
      },
    ]);
  }, []);

  const send = useCallback(
    async (override?: string) => {
      const message = (override ?? input).trim();
      if (!message || isSending || isApplying || !canUse || !planId) return;

      setMessages(current => [
        ...current,
        { id: nextMessageId(), role: 'user', text: message, at: stampNow() },
      ]);
      setInput('');
      setNotice(null);
      setSending(true);
      try {
        const reply = await askChatbot(planId, {
          message,
          pendingContext: pendingPlan,
          shownPlaces,
          recentMessages,
        });
        const places = Array.isArray(reply.shownPlaces)
          ? reply.shownPlaces
          : [];
        appendBot(
          reply.userMessage ||
            '요청을 확인했어요. 원하는 내용을 조금 더 자세히 알려 주세요.',
          places,
        );
        if (reply.plan) setPendingPlan(reply.plan);
        setShownPlaces(places);
        setRecentMessages(current =>
          [...current, message.slice(0, 500)].slice(-3),
        );
      } catch (error) {
        appendBot(getChatbotErrorMessage(error, 'chat'));
      } finally {
        setSending(false);
      }
    },
    [
      appendBot,
      canUse,
      input,
      isApplying,
      isSending,
      pendingPlan,
      planId,
      recentMessages,
      shownPlaces,
    ],
  );

  const apply = useCallback(async () => {
    if (!pendingPlan || isApplying || !canUse || !planId) return;

    setNotice(null);
    setApplying(true);
    try {
      const result = await applyChatbotPlan(planId, pendingPlan);
      setPendingPlan(null);
      setShownPlaces([]);
      // 반영은 REST로 일정을 통째로 바꿔 편집 방의 되돌리기 기록에 남지 않는다.
      // 되돌리기를 권하면 눌러도 아무 일이 없어 사용자가 더 헤맨다.
      appendBot(
        '제안한 내용을 일정에 반영했어요. 되돌리기로는 취소되지 않으니, 되돌리려면 시간표에서 해당 장소를 지워 주세요.',
      );
      setNotice({
        type: result.conflictDetected ? 'warning' : 'success',
        text: result.conflictDetected
          ? '대화하는 사이에 다른 사람도 일정을 고쳤어요. 시간표에서 결과를 확인해 주세요.'
          : '일정 반영이 완료됐어요.',
      });
      onApplied?.();
    } catch (error) {
      setNotice({
        type: 'error',
        text: getChatbotErrorMessage(error, 'apply'),
      });
    } finally {
      setApplying(false);
    }
  }, [appendBot, canUse, isApplying, onApplied, pendingPlan, planId]);

  const discard = useCallback(() => {
    setPendingPlan(null);
    setShownPlaces([]);
    setNotice({
      type: 'neutral',
      text: '변경 제안을 취소했어요. 현재 저장된 일정은 그대로예요.',
    });
  }, []);

  if (!visible) return null;

  const blocks = pendingPlan?.placeBlocks ?? [];
  const dayCount = pendingPlan?.timetables?.length ?? 0;
  const isBusy = isSending || isApplying;
  const canSend = canUse && !!input.trim() && !isBusy;
  const bottom = WINDOW_BOTTOM + keyboardHeight;

  return (
    <View style={[styles.window, { top: WINDOW_TOP, bottom }]}>
      <View style={styles.head}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Bot size={normalize(19)} color={COLORS.primary} />
            <View style={styles.avatarDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headTitle}>AI 여행 도우미</Text>
            <View style={styles.headSubtitle}>
              <Sparkles size={normalize(11)} color={COLORS.primary} />
              <Text style={styles.headSubtitleText}>
                일정 추천부터 수정까지
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headActions}>
          {/* 웹은 진입 단추만으로 여닫지만, 앱은 그 단추가 추천 장소 시트를
              올리면 가려진다. 닫을 자리가 사라지지 않게 여기에도 둔다. */}
          <TouchableOpacity
            style={styles.headClose}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="AI 여행 도우미 닫기"
            hitSlop={6}
          >
            <X size={normalize(17)} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {!canUse ? (
        <View style={styles.scroll}>
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Bot size={normalize(24)} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              저장된 일정에서 사용할 수 있어요
            </Text>
            <Text style={styles.emptyBody}>
              일정을 먼저 저장한 뒤 AI에게 장소 추천과 일정 수정을 요청해
              보세요.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.body}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="handled"
        >
          {!!notice && (
            <View
              style={[
                styles.notice,
                {
                  backgroundColor: NOTICE_TONE[notice.type].bg,
                  borderColor: NOTICE_TONE[notice.type].border,
                },
              ]}
              accessibilityRole="alert"
            >
              {notice.type === 'success' ? (
                <Check size={normalize(14)} color={NOTICE_TONE.success.fg} />
              ) : (
                <AlertCircle
                  size={normalize(14)}
                  color={NOTICE_TONE[notice.type].fg}
                />
              )}
              <Text
                style={[
                  styles.noticeText,
                  { color: NOTICE_TONE[notice.type].fg },
                ]}
              >
                {notice.text}
              </Text>
            </View>
          )}

          {messages.map(message => {
            const mine = message.role === 'user';
            const segments = toSegments(message.text, message.places);
            return (
              <View
                key={message.id}
                style={[styles.row, mine && styles.rowMine]}
              >
                <View
                  style={[
                    styles.bubble,
                    mine ? styles.bubbleMine : styles.bubbleBot,
                  ]}
                >
                  {/* 이름이 나온 줄 바로 아래에 그 카드를 세운다. 이름만
                    늘어놓으면 어떤 곳인지 그려지지 않고, 카드를 말끝에 몰아
                    세우면 몇 번째로 권한 곳인지가 끊긴다. */}
                  {segments.map((segment, index) =>
                    segment.kind === 'text' ? (
                      <Text
                        key={segment.key}
                        style={[
                          styles.bubbleText,
                          mine && styles.bubbleTextMine,
                          index > 0 && styles.bubbleTextAfterCard,
                        ]}
                      >
                        {segment.text}
                      </Text>
                    ) : (
                      <View key={segment.key} style={styles.placeCard}>
                        <PlaceThumb uri={segment.place.thumbnailUrl} />
                        <View style={styles.placeBody}>
                          <Text style={styles.placeCategory}>
                            {CATEGORY_LABELS[segment.place.category ?? ''] ??
                              segment.place.category ??
                              '여행 장소'}
                          </Text>
                          <Text style={styles.placeTitle} numberOfLines={1}>
                            {segment.place.title}
                          </Text>
                          <Text style={styles.placeAddr} numberOfLines={2}>
                            {segment.place.addr1 || '주소 정보 없음'}
                          </Text>
                        </View>
                      </View>
                    ),
                  )}

                  {!!message.at && (
                    <View style={styles.stamp}>
                      <Clock3
                        size={normalize(9)}
                        color={mine ? '#C7D2FE' : COLORS.textTertiary}
                      />
                      <Text
                        style={[styles.stampText, mine && styles.stampTextMine]}
                      >
                        {message.at}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {messages.length === 1 &&
            QUICK_PROMPTS.map(prompt => (
              <TouchableOpacity
                key={prompt}
                style={styles.prompt}
                onPress={() => void send(prompt)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={prompt}
              >
                <Text style={styles.promptText} numberOfLines={1}>
                  {prompt}
                </Text>
                <ChevronRight
                  size={normalize(14)}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
            ))}

          {isSending && (
            <View style={styles.pending}>
              <View style={styles.pendingLine}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.pendingText}>일정을 살펴보고 있어요</Text>
              </View>
              <Text style={styles.pendingSub}>
                내용에 따라 최대 40초 정도 걸릴 수 있어요.
              </Text>
            </View>
          )}

          {!!pendingPlan && (
            <View style={styles.preview}>
              <View style={styles.previewHead}>
                <View style={{ flex: 1 }}>
                  <View style={styles.previewCount}>
                    <Sparkles size={normalize(13)} color={COLORS.primary} />
                    <Text style={styles.previewEyebrow}>변경 미리보기</Text>
                  </View>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {planName(pendingPlan)}
                  </Text>
                </View>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>아직 미반영</Text>
                </View>
              </View>

              <View style={styles.previewBody}>
                <View style={styles.previewCounts}>
                  <View style={styles.previewCount}>
                    <CalendarDays size={normalize(13)} color={COLORS.primary} />
                    <Text style={styles.previewCountText}>{dayCount}일</Text>
                  </View>
                  <View style={styles.previewCount}>
                    <MapPin size={normalize(13)} color={COLORS.primary} />
                    <Text style={styles.previewCountText}>
                      {blocks.length}개 장소
                    </Text>
                  </View>
                </View>

                {blocks.length > 0 && (
                  <View style={styles.previewBlocks}>
                    {blocks.slice(0, 3).map((block, index) => (
                      <View
                        key={`${block.blockId ?? index}-${block.date ?? ''}`}
                        style={styles.previewBlockRow}
                      >
                        <Text style={styles.previewBlockTime}>
                          {blockTime(block)}
                        </Text>
                        <Text style={styles.previewBlockName} numberOfLines={1}>
                          {block.placeName}
                        </Text>
                      </View>
                    ))}
                    {blocks.length > 3 && (
                      <Text style={styles.previewMore}>
                        외 {blocks.length - 3}개 장소
                      </Text>
                    )}
                  </View>
                )}

                <Text style={styles.previewHint}>
                  내용을 더 바꾸고 싶다면 아래 입력창에서 이어서 요청하세요.
                </Text>
              </View>

              <View style={styles.previewFoot}>
                <TouchableOpacity
                  style={styles.previewDiscard}
                  onPress={discard}
                  disabled={isApplying}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="제안 취소"
                >
                  <Text style={styles.previewDiscardText}>제안 취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.previewApply,
                    isApplying && styles.previewBusy,
                  ]}
                  onPress={() => void apply()}
                  disabled={isApplying}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="이 일정에 반영"
                  accessibilityState={{ disabled: isApplying }}
                >
                  {isApplying ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Check size={normalize(14)} color={COLORS.white} />
                  )}
                  <Text style={styles.previewApplyText}>
                    {isApplying ? '반영 중...' : '이 일정에 반영'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.foot}>
        {!!pendingPlan && (
          <View style={styles.carry}>
            <Sparkles size={normalize(12)} color={COLORS.primary} />
            <Text style={styles.carryText}>
              {dayCount}일 · {blocks.length}개 장소 제안을 이어서 수정 중
            </Text>
          </View>
        )}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={
              canUse
                ? '원하는 일정이나 장소를 말해 주세요'
                : '일정을 저장하면 사용할 수 있어요'
            }
            placeholderTextColor={COLORS.textTertiary}
            editable={canUse && !isBusy}
            multiline
            maxLength={CHATBOT_MESSAGE_MAX_LENGTH}
            accessibilityLabel="AI 도우미에게 보낼 말"
          />
          <TouchableOpacity
            style={[styles.send, !canSend && styles.sendOff]}
            onPress={() => void send()}
            disabled={!canSend}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="메시지 보내기"
            accessibilityState={{ disabled: !canSend }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Send size={normalize(16)} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          AI 제안은 반영 전 미리 확인해 주세요.
        </Text>
      </View>
    </View>
  );
}
