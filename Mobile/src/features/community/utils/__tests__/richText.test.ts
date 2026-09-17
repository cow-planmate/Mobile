import { blocksToHtml, htmlToBlocks } from '../richText';
import { ContentBlock } from '../../types';

const textOf = (block: ContentBlock) =>
  (Array.isArray(block.content) ? block.content : [])
    .map(item => item.text ?? '')
    .join('');

describe('richText', () => {
  describe('htmlToBlocks', () => {
    it('제목은 단계를 3까지만 쓴다', () => {
      const blocks = htmlToBlocks('<h1>경주</h1><h2>첨성대</h2><h5>깊은 제목</h5>');

      expect(blocks.map(b => b.type)).toEqual(['heading', 'heading', 'heading']);
      expect(blocks.map(b => b.props?.level)).toEqual([1, 2, 3]);
      expect(blocks.map(textOf)).toEqual(['경주', '첨성대', '깊은 제목']);
    });

    it('목록은 항목마다 블록 하나로 편다', () => {
      const blocks = htmlToBlocks(
        '<ul><li><p>첨성대</p></li><li><p>불국사</p></li></ul>' +
          '<ol><li><p>첫째</p></li></ol>',
      );

      expect(blocks.map(b => b.type)).toEqual([
        'bulletListItem',
        'bulletListItem',
        'numberedListItem',
      ]);
      expect(blocks.map(textOf)).toEqual(['첨성대', '불국사', '첫째']);
    });

    it('인용은 안쪽 문단 겹을 걷는다', () => {
      const blocks = htmlToBlocks('<blockquote><p>좋았다</p></blockquote>');

      expect(blocks[0].type).toBe('quote');
      expect(textOf(blocks[0])).toBe('좋았다');
    });

    it('겹친 서식은 한 조각에 모아 준다', () => {
      const blocks = htmlToBlocks('<p>정말 <strong><em>좋았다</em></strong></p>');
      const parts = blocks[0].content as { text?: string; styles?: object }[];

      expect(parts[0]).toMatchObject({ text: '정말 ' });
      expect(parts[1]).toMatchObject({
        text: '좋았다',
        styles: { bold: true, italic: true },
      });
    });

    it('링크와 구분선을 알아본다', () => {
      const blocks = htmlToBlocks(
        '<p><a href="https://planmate.test">여기</a></p><hr>',
      );

      expect(blocks[0].content).toEqual([
        expect.objectContaining({ type: 'link', href: 'https://planmate.test' }),
      ]);
      expect(blocks[1].type).toBe('divider');
    });

    it('할 일 목록은 체크 상태까지 옮긴다', () => {
      const blocks = htmlToBlocks(
        '<ul data-type="taskList">' +
          '<li data-checked="true"><p>숙소 예약</p></li>' +
          '<li data-checked="false"><p>기차표</p></li>' +
          '</ul>',
      );

      expect(blocks.map(b => b.type)).toEqual(['checkListItem', 'checkListItem']);
      expect(blocks.map(b => b.props?.checked)).toEqual([true, false]);
    });

    it('꺾쇠 기호는 글자로 되돌린다', () => {
      const blocks = htmlToBlocks('<p>a &lt; b &amp;&amp; c &gt; d</p>');

      expect(textOf(blocks[0])).toBe('a < b && c > d');
    });

    it('빈 본문에도 문단 하나는 남긴다', () => {
      expect(htmlToBlocks('')).toHaveLength(1);
      expect(htmlToBlocks('')[0].type).toBe('paragraph');
    });
  });

  describe('blocksToHtml', () => {
    it('이어지는 같은 갈래는 목록 하나로 묶는다', () => {
      const html = blocksToHtml([
        { type: 'bulletListItem', content: [{ type: 'text', text: '첨성대' }] },
        { type: 'bulletListItem', content: [{ type: 'text', text: '불국사' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '끝' }] },
      ]);

      expect(html).toBe(
        '<ul><li><p>첨성대</p></li><li><p>불국사</p></li></ul><p>끝</p>',
      );
    });

    it('서식은 바깥부터 굵게 순서로 감싼다', () => {
      const html = blocksToHtml([
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '좋았다', styles: { bold: true, italic: true } },
          ],
        },
      ]);

      expect(html).toBe('<p><strong><em>좋았다</em></strong></p>');
    });

    it('블록으로 돌렸다가 다시 읽어도 같은 글이 남는다', () => {
      const original =
        '<h1>경주 2박 3일</h1>' +
        '<ul><li><p>첨성대</p></li><li><p>불국사</p></li></ul>' +
        '<blockquote><p>또 가고 싶다</p></blockquote>' +
        '<p>정말 <strong>좋았다</strong></p>';

      expect(blocksToHtml(htmlToBlocks(original))).toBe(original);
    });

    it('빈 블록은 빈 문자열로 돌려준다', () => {
      expect(blocksToHtml([])).toBe('');
      expect(blocksToHtml(null)).toBe('');
    });
  });
});
