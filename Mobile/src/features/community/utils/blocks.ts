import { BlockInlineContent, ContentBlock } from '../types';

const createBlockId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const inlineToText = (
  content: BlockInlineContent[] | string | undefined,
): string => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map(item => {
      if (typeof item?.text === 'string') return item.text;

      if (Array.isArray(item?.content)) return inlineToText(item.content);
      return '';
    })
    .join('');
};

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

export const asBlocks = (content: unknown): ContentBlock[] | null => {
  if (Array.isArray(content) && content.length > 0) {
    return content as ContentBlock[];
  }
  return null;
};

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
