import { BlockInlineContent, ContentBlock } from '../types';

/**
 * BlockNote 블록 JSON 유틸.
 *
 * 커뮤니티 본문은 웹 에디터(BlockNote)가 만든 블록 배열로 저장된다. 앱에는
 * 에디터가 없으므로,
 *  - 읽을 때는 블록에서 표시용 텍스트를 뽑고(PostContentView가 렌더링),
 *  - 쓸 때는 평문을 서버가 이해하는 최소 블록 형태로 변환한다.
 * 웹에서 그 글을 열어도 정상 문단으로 보이도록 실제 저장 형태와 동일한 필드를
 * 채운다.
 */

/** 블록 식별자. BlockNote는 UUID를 쓰지만 서버는 문자열이면 그대로 저장한다. */
const createBlockId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** 인라인 조각(텍스트/링크)에서 평문만 뽑는다. */
export const inlineToText = (
  content: BlockInlineContent[] | string | undefined,
): string => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map(item => {
      if (typeof item?.text === 'string') return item.text;
      // 링크는 자식 인라인에 실제 텍스트가 들어 있다
      if (Array.isArray(item?.content)) return inlineToText(item.content);
      return '';
    })
    .join('');
};

/** 블록 배열에서 검색/미리보기용 평문을 만든다 (웹 blocksToText와 동일 규칙). */
export const blocksToText = (blocks: ContentBlock[]): string =>
  blocks
    .map(block => {
      const inline = inlineToText(block?.content);
      const children = Array.isArray(block?.children)
        ? blocksToText(block.children)
        : '';
      return [inline, children].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n');

/** 서버 응답의 content가 렌더링 가능한 블록 배열인지 판별한다. */
export const asBlocks = (content: unknown): ContentBlock[] | null => {
  if (Array.isArray(content) && content.length > 0) {
    return content as ContentBlock[];
  }
  return null;
};

/**
 * 평문을 BlockNote 문단 블록 배열로 변환한다.
 *
 * 줄 하나가 문단 하나가 된다. 빈 줄도 빈 문단으로 보존해 웹에서 열었을 때
 * 작성자가 의도한 줄바꿈이 유지되게 한다.
 */
export const textToBlocks = (text: string): ContentBlock[] => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  return lines.map(line => ({
    id: createBlockId(),
    type: 'paragraph',
    props: {
      textColor: 'default',
      textAlignment: 'left',
      backgroundColor: 'default',
    },
    content: line
      ? [{ type: 'text', text: line, styles: {} } as BlockInlineContent]
      : [],
    children: [],
  }));
};
