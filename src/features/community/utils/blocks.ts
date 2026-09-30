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

export const parseInlineStyles = (text: string): BlockInlineContent[] => {
  if (!text) return [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map(part => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return {
        type: 'text',
        text: part.slice(2, -2),
        styles: { bold: true },
      } as BlockInlineContent;
    }
    return {
      type: 'text',
      text: part,
      styles: {},
    } as BlockInlineContent;
  });
};

export const textToBlocks = (text: string): ContentBlock[] => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  return lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return {
        id: createBlockId(),
        type: 'heading',
        props: {
          level: 1,
          textColor: 'default',
          textAlignment: 'left',
          backgroundColor: 'default',
        },
        content: parseInlineStyles(trimmed.slice(2)),
        children: [],
      };
    }
    if (trimmed.startsWith('## ')) {
      return {
        id: createBlockId(),
        type: 'heading',
        props: {
          level: 2,
          textColor: 'default',
          textAlignment: 'left',
          backgroundColor: 'default',
        },
        content: parseInlineStyles(trimmed.slice(3)),
        children: [],
      };
    }
    if (trimmed.startsWith('### ')) {
      return {
        id: createBlockId(),
        type: 'heading',
        props: {
          level: 3,
          textColor: 'default',
          textAlignment: 'left',
          backgroundColor: 'default',
        },
        content: parseInlineStyles(trimmed.slice(4)),
        children: [],
      };
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return {
        id: createBlockId(),
        type: 'bulletListItem',
        props: {
          textColor: 'default',
          textAlignment: 'left',
          backgroundColor: 'default',
        },
        content: parseInlineStyles(trimmed.slice(2)),
        children: [],
      };
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      return {
        id: createBlockId(),
        type: 'numberedListItem',
        props: {
          textColor: 'default',
          textAlignment: 'left',
          backgroundColor: 'default',
        },
        content: parseInlineStyles(match ? match[2] : trimmed),
        children: [],
      };
    }
    if (trimmed.startsWith('> ')) {
      return {
        id: createBlockId(),
        type: 'quote',
        props: {
          textColor: 'default',
          textAlignment: 'left',
          backgroundColor: 'default',
        },
        content: parseInlineStyles(trimmed.slice(2)),
        children: [],
      };
    }
    if (trimmed === '---') {
      return {
        id: createBlockId(),
        type: 'divider',
        props: {
          textColor: 'default',
          textAlignment: 'left',
          backgroundColor: 'default',
        },
        content: [],
        children: [],
      };
    }

    return {
      id: createBlockId(),
      type: 'paragraph',
      props: {
        textColor: 'default',
        textAlignment: 'left',
        backgroundColor: 'default',
      },
      content: line ? parseInlineStyles(line) : [],
      children: [],
    };
  });
};
