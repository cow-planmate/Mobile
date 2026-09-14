import axios, { AxiosError } from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import { parseBackendError } from '../utils/errorHandler';

/**
 * AI 여행 도우미.
 *
 * 웹 Create/ChatBot.jsx와 같은 두 자리를 쓴다 - 말을 걸어 제안을 받고(chatbot),
 * 받아든 제안을 일정에 반영한다(chatbot-apply). 제안은 받는 즉시 저장되지 않고
 * 사용자가 반영을 누를 때까지 앱이 들고 있는다.
 */

export const CHATBOT_MESSAGE_MAX_LENGTH = 1000;

/**
 * 말을 거는 쪽만 따로 더 기다린다. 전역 기본값은 15초인데(axiosConfig) AI가
 * 답을 만드는 데는 10초 안팎이 걸려 조금만 느려도 정상 요청이 실패로 떨어진다.
 * 웹에는 전역 제한이 없어 앱에서만 나던 증상이다.
 */
const ASK_TIMEOUT_MS = 60000;

export interface ChatbotPlace {
  contentId?: string | number | null;
  title?: string | null;
  category?: string | null;
  addr1?: string | null;
  thumbnailUrl?: string | null;
}

export interface ChatbotPlanBlock {
  blockId?: number | string | null;
  date?: string | null;
  blockStartTime?: string | null;
  blockEndTime?: string | null;
  placeName?: string | null;
}

export interface ChatbotPlan {
  planFrame?: { planName?: string | null; name?: string | null } | null;
  timetables?: unknown[] | null;
  placeBlocks?: ChatbotPlanBlock[] | null;
}

export interface ChatbotReply {
  userMessage?: string | null;
  plan?: ChatbotPlan | null;
  shownPlaces?: ChatbotPlace[] | null;
}

export interface ChatbotAskParams {
  message: string;
  /** 아직 반영하지 않은 제안. 이어서 고칠 때 그대로 돌려보낸다. */
  pendingContext: ChatbotPlan | null;
  /** 방금 보여 준 장소들. 같은 것을 다시 권하지 않게 알려 준다. */
  shownPlaces: ChatbotPlace[];
  /** 직전 대화 세 마디. 서버가 맥락을 잇는 데 쓴다. */
  recentMessages: string[];
}

export async function askChatbot(
  planId: string,
  params: ChatbotAskParams,
  signal?: AbortSignal,
): Promise<ChatbotReply> {
  const { data } = await axios.post(
    resolveApiUrl(`/api/plan/${planId}/chatbot`),
    {
      message: params.message,
      pendingContext: params.pendingContext,
      // 서버는 아이디가 있는 것만 받는다. 빈 배열 대신 null로 보내 웹과 맞춘다.
      shownPlaces: params.shownPlaces.length
        ? params.shownPlaces
            .filter(place => place.contentId != null)
            .map(place => ({
              contentId: String(place.contentId),
              title: place.title,
              category: place.category,
            }))
        : null,
      recentMessages: params.recentMessages.slice(-3),
    },
    { signal, timeout: ASK_TIMEOUT_MS },
  );
  return (data ?? {}) as ChatbotReply;
}

export interface ChatbotApplyResult {
  /** 대화 중에 다른 사람이 같은 일정을 고쳤는지. */
  conflictDetected?: boolean;
}

export async function applyChatbotPlan(
  planId: string,
  plan: ChatbotPlan,
): Promise<ChatbotApplyResult> {
  const { data } = await axios.post(
    resolveApiUrl(`/api/plan/${planId}/chatbot-apply`),
    { plan },
  );
  return (data ?? {}) as ChatbotApplyResult;
}

/**
 * 실패를 사람 말로 옮긴다. 문구와 갈래는 웹 getErrorMessage와 같게 둔다 -
 * 같은 서버가 주는 같은 실패를 두 앱이 다르게 설명하면 문의가 갈린다.
 */
export function getChatbotErrorMessage(
  error: unknown,
  mode: 'chat' | 'apply',
): string {
  const { code } = parseBackendError(error);
  const status = (error as AxiosError | undefined)?.response?.status;

  if (code === 'CHATBOT_003' || status === 409) {
    return '반영할 수 있는 시간이 지났어요. 새 대화로 다시 물어봐 주세요.';
  }
  if (status === 403) {
    return '이 일정을 고칠 수 있는 사람만 AI 도우미를 쓸 수 있어요.';
  }
  if (status === 404) {
    return 'AI 도우미가 아직 연결되지 않았어요. 잠시 뒤에 다시 시도해 주세요.';
  }
  if (mode === 'apply') {
    return '제안을 반영하지 못했어요. 일정이 바뀐 것 같으면 화면을 다시 열어 확인해 주세요.';
  }
  return 'AI가 잠시 답하지 못했어요. 잠시 뒤에 다시 시도해 주세요.';
}
