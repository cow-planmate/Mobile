import axios from 'axios';
import {
  CHECKLIST_CONTENT_MAX_LENGTH,
  createChecklistItem,
  deleteChecklistItem,
  editChecklistItemChecked,
  editChecklistItemContent,
  getChecklist,
  normalizeChecklistItems,
  reorderChecklistItems,
} from '../src/api/checklist';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const PLAN_ID = '3f6c1b7e-0000-4000-8000-000000000001';

describe('체크리스트 API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('경로 조립', () => {
    it('공유 체크리스트는 /checklist를 쓴다', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } });

      await getChecklist(PLAN_ID, 'shared');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/plan/${PLAN_ID}/checklist`),
      );
      expect(mockedAxios.get.mock.calls[0][0]).not.toContain('/checklist/me');
    });

    it('개인 체크리스트는 /checklist/me를 쓴다', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } });

      await getChecklist(PLAN_ID, 'personal');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/plan/${PLAN_ID}/checklist/me`),
      );
    });

    it('완료 토글은 항목 경로 뒤에 /check를 붙인다', async () => {
      mockedAxios.patch.mockResolvedValueOnce({ data: undefined });

      await editChecklistItemChecked(PLAN_ID, 'personal', 7, true);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/plan/${PLAN_ID}/checklist/me/7/check`),
        { isChecked: true },
      );
    });

    it('삭제는 항목 ID를 경로에 붙인다', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: undefined });

      await deleteChecklistItem(PLAN_ID, 'shared', 12);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`/api/plan/${PLAN_ID}/checklist/12`),
      );
    });
  });

  describe('응답 정규화', () => {
    it('sortOrder 순으로 정렬한다', () => {
      const items = normalizeChecklistItems({
        items: [
          { itemId: 3, content: '숙소 예약', isChecked: false, sortOrder: 2 },
          { itemId: 1, content: '여권 확인', isChecked: true, sortOrder: 0 },
          { itemId: 2, content: '환전', isChecked: false, sortOrder: 1 },
        ],
      });

      expect(items.map(item => item.itemId)).toEqual([1, 2, 3]);
    });

    it('sortOrder가 같으면 itemId 오름차순으로 순서를 고정한다', () => {

      const items = normalizeChecklistItems({
        items: [
          { itemId: 9, content: '나중 항목', isChecked: false, sortOrder: 2 },
          { itemId: 4, content: '기존 항목', isChecked: false, sortOrder: 2 },
        ],
      });

      expect(items.map(item => item.itemId)).toEqual([4, 9]);
    });

    it('items 래퍼 없이 배열만 와도 처리한다', () => {
      const items = normalizeChecklistItems([
        { itemId: 1, content: '짐 싸기', isChecked: false, sortOrder: 0 },
      ]);

      expect(items).toHaveLength(1);
      expect(items[0].content).toBe('짐 싸기');
    });

    it('목록이 없거나 형식이 어긋나면 빈 배열을 돌려준다', () => {
      expect(normalizeChecklistItems(undefined)).toEqual([]);
      expect(normalizeChecklistItems({})).toEqual([]);
      expect(normalizeChecklistItems({ items: null })).toEqual([]);
    });
  });

  describe('내용 검증', () => {
    it('앞뒤 공백을 제거해서 보낸다', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { itemId: 5 } });

      const itemId = await createChecklistItem(PLAN_ID, 'shared', '  우산  ');

      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
        content: '우산',
      });
      expect(itemId).toBe(5);
    });

    it('공백만 있으면 요청하지 않는다', async () => {
      await expect(
        createChecklistItem(PLAN_ID, 'shared', '   '),
      ).rejects.toThrow('내용을 입력해 주세요.');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('255자를 넘으면 요청하지 않는다', async () => {
      const tooLong = 'ㄱ'.repeat(CHECKLIST_CONTENT_MAX_LENGTH + 1);

      await expect(
        editChecklistItemContent(PLAN_ID, 'personal', 1, tooLong),
      ).rejects.toThrow('255자를 넘을 수 없습니다.');
      expect(mockedAxios.patch).not.toHaveBeenCalled();
    });
  });

  describe('순서 변경', () => {
    it('itemIds 배열을 그대로 보낸다', async () => {
      mockedAxios.patch.mockResolvedValueOnce({ data: undefined });

      await reorderChecklistItems(PLAN_ID, 'shared', [3, 1, 2]);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/plan/${PLAN_ID}/checklist/order`),
        { itemIds: [3, 1, 2] },
      );
    });

    it('빈 목록은 요청하지 않는다', async () => {
      await expect(
        reorderChecklistItems(PLAN_ID, 'shared', []),
      ).rejects.toThrow('정렬할 항목이 없습니다.');
      expect(mockedAxios.patch).not.toHaveBeenCalled();
    });
  });
});
