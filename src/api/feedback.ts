import axios from 'axios';

/**
 * 베타 피드백. 웹 common/Feedback.jsx와 같은 자리(POST /api/beta/feedback)를 쓴다.
 * 본문은 내용 하나뿐이고 비어 있으면 서버가 거절한다. 성공하면 201에 본문이 없다.
 */
export const FEEDBACK_MAX_LENGTH = 1000;

export const submitFeedback = async (content: string): Promise<void> => {
  await axios.post('/api/beta/feedback', { content: content.trim() });
};
