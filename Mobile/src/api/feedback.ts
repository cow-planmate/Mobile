import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

export const FEEDBACK_EMPTY_MESSAGE = '피드백 내용을 입력해 주세요.';

export async function submitFeedback(content: string): Promise<void> {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error(FEEDBACK_EMPTY_MESSAGE);
  }

  await axios.post(resolveApiUrl('/api/beta/feedback'), {
    content: trimmedContent,
  });
}
