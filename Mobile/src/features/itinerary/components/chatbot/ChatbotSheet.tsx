import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import RotateCcw from 'lucide-react-native/dist/esm/icons/rotate-ccw';
import Send from 'lucide-react-native/dist/esm/icons/send';
import Sparkles from 'lucide-react-native/dist/esm/icons/sparkles';
import SheetModal from '../../../../components/common/SheetModal';
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
import { COLORS, styles } from './ChatbotSheet.styles';

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
}

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

const welcomeMessage = (): Message => ({
  id: nextMessageId(),
  role: 'assistant',
  text: WELCOME,
});

const planName = (plan: ChatbotPlan) =>
  plan.planFrame?.planName ?? plan.planFrame?.name ?? '일정 변경 제안';

const blockTime = (block: ChatbotPlanBlock) => {
  const start = block.blockStartTime?.slice(0, 5);
  const end = block.blockEndTime?.slice(0, 5);
  if (start && end) return `${start}–${end}`;
  return start ?? '시간 미정';
};

interface ChatbotSheetProps {
  visible: boolean;
  onClose: () => void;
  planId: string | null;
  /** 반영이 끝나면 시간표를 다시 받아 와야 한다. */
  onApplied?: () => void;
}

/**
 * AI 여행 도우미.
 *
 * 웹 ChatBot과 같은 흐름이다 - 말을 걸면 제안이 오고, 제안은 반영을 눌러야
 * 일정에 들어간다. 받자마자 반영하지 않는 이유는 같이 편집하는 사람의 화면도
 * 함께 바뀌기 때문이다. 무엇이 바뀌는지 먼저 보여 주고 확인을 받는다.
 */
export default function ChatbotSheet({
  visible,
  onClose,
  planId,
  onApplied,
}: ChatbotSheetProps) {
  const canUse = !!planId && planId !== '-1' && planId !== '0';

  const [messages, setMessages] = useState<Message[]>(() => [welcomeMessage()]);
  const [input, setInput] = useState('');
  const [isSending, setSending] = useState(false);
  const [isApplying, setApplying] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ChatbotPlan | null>(null);
  const [shownPlaces, setShownPlaces] = useState<ChatbotPlace[]>([]);
  const [recentMessages, setRecentMessages] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const scrollRef = useRef<ScrollView>(null);

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

  const appendBot = useCallback((text: string) => {
    setMessages(current => [
      ...current,
      { id: nextMessageId(), role: 'assistant', text },
    ]);
  }, []);

  const send = useCallback(
    async (override?: string) => {
      const message = (override ?? input).trim();
      if (!message || isSending || isApplying || !canUse || !planId) return;

      setMessages(current => [
        ...current,
        { id: nextMessageId(), role: 'user', text: message },
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
        appendBot(
          reply.userMessage ||
            '요청을 확인했어요. 원하는 내용을 조금 더 자세히 알려 주세요.',
        );
        if (reply.plan) setPendingPlan(reply.plan);
        setShownPlaces(
          Array.isArray(reply.shownPlaces) ? reply.shownPlaces : [],
        );
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
      appendBot('제안한 내용을 일정에 반영했어요. 시간표에서 확인해 보세요.');
      setNotice({
        type: result.conflictDetected ? 'warning' : 'success',
        text: result.conflictDetected
          ? '대화하는 사이에 다른 사람도 일정을 고쳤어요. 결과를 보고 필요하면 되돌리기를 눌러 주세요.'
          : '일정에 반영했어요.',
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
      text: '제안을 취소했어요. 지금 저장된 일정은 그대로예요.',
    });
  }, []);

  const blocks = pendingPlan?.placeBlocks ?? [];
  const dayCount = pendingPlan?.timetables?.length ?? 0;
  const isBusy = isSending || isApplying;
  const canSend = canUse && !!input.trim() && !isBusy;

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      title="AI 여행 도우미"
      avoidKeyboard
      maxHeightRatio={0.88}
      headerAction={
        <TouchableOpacity
          style={styles.headerAction}
          onPress={reset}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="새 대화 시작"
        >
          <RotateCcw size={normalize(13)} color={COLORS.textSecondary} />
          <Text style={styles.headerActionText}>새 대화</Text>
        </TouchableOpacity>
      }
      footer={
        <View>
          {!!pendingPlan && (
            <View style={styles.previewCount}>
              <Sparkles size={normalize(12)} color={COLORS.primary} />
              <Text style={styles.previewEyebrow}>
                {dayCount}일 · 장소 {blocks.length}곳 제안을 이어서 고치는 중
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
                  : '일정을 저장하면 쓸 수 있어요'
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
            AI 제안은 반영하기 전에 한 번 확인해 주세요.
          </Text>
        </View>
      }
    >
      {!canUse ? (
        <View style={styles.empty}>
          <Bot size={normalize(28)} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>저장된 일정에서 쓸 수 있어요</Text>
          <Text style={styles.emptyBody}>
            일정을 먼저 저장한 뒤에 장소 추천과 일정 수정을 부탁해 보세요.
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
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
                  <Text
                    style={[styles.bubbleText, mine && styles.bubbleTextMine]}
                  >
                    {message.text}
                  </Text>
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
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.pendingText}>일정을 살펴보고 있어요</Text>
            </View>
          )}

          {shownPlaces.length > 0 && (
            <View style={styles.section}>
              <View>
                <Text style={styles.sectionTitle}>추천 장소</Text>
                <Text style={styles.sectionHint}>
                  조건을 바꿔 이어서 물어볼 수 있어요
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.placeStrip}
              >
                {shownPlaces.map((place, index) => (
                  <View
                    key={`${place.contentId ?? 'place'}-${index}`}
                    style={styles.placeCard}
                  >
                    {place.thumbnailUrl ? (
                      <Image
                        source={{ uri: place.thumbnailUrl }}
                        style={styles.placeThumb}
                      />
                    ) : (
                      <View style={[styles.placeThumb, styles.placeThumbEmpty]}>
                        <MapPin
                          size={normalize(18)}
                          color={COLORS.borderStrong}
                        />
                      </View>
                    )}
                    <View style={styles.placeBody}>
                      <Text style={styles.placeCategory}>
                        {CATEGORY_LABELS[place.category ?? ''] ??
                          place.category ??
                          '여행 장소'}
                      </Text>
                      <Text style={styles.placeTitle} numberOfLines={1}>
                        {place.title}
                      </Text>
                      <Text style={styles.placeAddr} numberOfLines={1}>
                        {place.addr1 || '주소 정보 없음'}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
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
                      장소 {blocks.length}곳
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
                        외 {blocks.length - 3}곳
                      </Text>
                    )}
                  </View>
                )}
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
                    {isApplying ? '반영 중…' : '이 일정에 반영'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SheetModal>
  );
}
