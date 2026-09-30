import { BlockInlineContent, ContentBlock } from '../types';

/**
 * tentap(TipTap)은 HTML로 주고받고 서버는 BlockNote 블록으로 저장한다.
 * 그 사이를 옮기는 곳. 여행기 편집기가 실제로 낼 수 있는 서식만 다룬다.
 *
 * 여기서 다루지 않는 태그는 문단으로 떨어뜨린다. 글자를 잃는 것보다 낫다.
 */

const createBlockId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const DEFAULT_PROPS = {
  textColor: 'default',
  textAlignment: 'left',
  backgroundColor: 'default',
} as const;

const VOID_TAGS = new Set(['br', 'hr', 'img']);

const INLINE_MARKS: Record<string, string> = {
  strong: 'bold',
  b: 'bold',
  em: 'italic',
  i: 'italic',
  u: 'underline',
  s: 'strike',
  strike: 'strike',
  del: 'strike',
  code: 'code',
};

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeEntities = (text: string): string =>
  text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

interface Element {
  name: string;
  attrs: string;
  inner: string;
  /** 닫는 태그까지 지난 자리. */
  end: number;
}

/**
 * `at`에 있는 여는 태그 하나를 읽어 그 짝까지 돌려준다.
 *
 * 같은 이름이 안에 또 나올 수 있어서(ul 안의 ul) 깊이를 센다.
 */
const readElement = (html: string, at: number): Element | null => {
  const open = /^<([a-z][a-z0-9]*)((?:\s[^>]*?)?)\s*(\/?)>/i.exec(
    html.slice(at),
  );
  if (!open) return null;

  const name = open[1].toLowerCase();
  const attrs = open[2] ?? '';
  const contentStart = at + open[0].length;
  if (open[3] === '/' || VOID_TAGS.has(name)) {
    return { name, attrs, inner: '', end: contentStart };
  }

  const scan = new RegExp(`</?${name}\\b[^>]*>`, 'gi');
  scan.lastIndex = contentStart;
  let depth = 1;
  let match = scan.exec(html);
  while (match) {
    if (match[0][1] === '/') {
      depth -= 1;
      if (depth === 0) {
        return {
          name,
          attrs,
          inner: html.slice(contentStart, match.index),
          end: match.index + match[0].length,
        };
      }
    } else if (match[0][match[0].length - 2] !== '/') {
      depth += 1;
    }
    match = scan.exec(html);
  }

  return { name, attrs, inner: html.slice(contentStart), end: html.length };
};

const parseInline = (
  html: string,
  styles: Record<string, boolean> = {},
): BlockInlineContent[] => {
  const out: BlockInlineContent[] = [];
  const pushText = (raw: string) => {
    const text = decodeEntities(raw);
    if (!text) return;
    out.push({ type: 'text', text, styles: { ...styles } });
  };

  let cursor = 0;
  while (cursor < html.length) {
    const open = html.indexOf('<', cursor);
    if (open === -1) {
      pushText(html.slice(cursor));
      break;
    }
    if (open > cursor) pushText(html.slice(cursor, open));

    const element = readElement(html, open);
    if (!element) {
      pushText('<');
      cursor = open + 1;
      continue;
    }

    if (element.name === 'br') {
      pushText('\n');
    } else if (element.name === 'a') {
      const href = /href="([^"]*)"/i.exec(element.attrs)?.[1] ?? '';
      out.push({
        type: 'link',
        href: decodeEntities(href),
        content: parseInline(element.inner, styles),
      });
    } else if (INLINE_MARKS[element.name]) {
      out.push(
        ...parseInline(element.inner, {
          ...styles,
          [INLINE_MARKS[element.name]]: true,
        }),
      );
    } else {
      out.push(...parseInline(element.inner, styles));
    }
    cursor = element.end;
  }

  return out;
};

const block = (
  type: string,
  content: BlockInlineContent[],
  props: Record<string, unknown> = {},
  children: ContentBlock[] = [],
): ContentBlock => ({
  id: createBlockId(),
  type,
  props: { ...DEFAULT_PROPS, ...props },
  content,
  children,
});

/** 인용은 안에 문단을 한 겹 더 두므로 그 겹을 걷고 읽는다. */
const stripParagraphs = (html: string): string =>
  html.replace(/<\/p>\s*<p[^>]*>/gi, '\n').replace(/<\/?p[^>]*>/gi, '');

const parseListItems = (html: string, type: string): ContentBlock[] => {
  const items: ContentBlock[] = [];
  let cursor = 0;

  while (cursor < html.length) {
    const open = html.indexOf('<li', cursor);
    if (open === -1) break;
    const element = readElement(html, open);
    if (!element) break;

    // 중첩 목록은 자식으로 내린다.
    const nested: ContentBlock[] = [];
    const body = element.inner.replace(
      /<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>/gi,
      whole => {
        nested.push(...parseBlocks(whole));
        return '';
      },
    );

    const checked = /data-checked="true"/i.test(element.attrs);
    const isTask = /data-checked="/i.test(element.attrs);
    items.push(
      block(
        isTask ? 'checkListItem' : type,
        parseInline(stripParagraphs(body)),
        isTask ? { checked } : {},
        nested,
      ),
    );
    cursor = element.end;
  }

  return items;
};

const parseBlocks = (html: string): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  let cursor = 0;

  while (cursor < html.length) {
    const open = html.indexOf('<', cursor);
    if (open === -1) {
      const tail = decodeEntities(html.slice(cursor)).trim();
      if (tail) blocks.push(block('paragraph', parseInline(html.slice(cursor))));
      break;
    }
    // 태그 사이 공백은 버린다. TipTap은 블록 사이에 글자를 두지 않는다.
    if (open > cursor && html.slice(cursor, open).trim()) {
      blocks.push(block('paragraph', parseInline(html.slice(cursor, open))));
    }

    const element = readElement(html, open);
    if (!element) {
      cursor = open + 1;
      continue;
    }
    cursor = element.end;

    const heading = /^h([1-6])$/.exec(element.name);
    if (heading) {
      blocks.push(
        block('heading', parseInline(element.inner), {
          level: Math.min(Number(heading[1]), 3),
        }),
      );
      continue;
    }

    switch (element.name) {
      case 'ul':
        blocks.push(...parseListItems(element.inner, 'bulletListItem'));
        break;
      case 'ol':
        blocks.push(...parseListItems(element.inner, 'numberedListItem'));
        break;
      case 'blockquote':
        blocks.push(block('quote', parseInline(stripParagraphs(element.inner))));
        break;
      case 'hr':
        blocks.push(block('divider', []));
        break;
      default:
        blocks.push(block('paragraph', parseInline(element.inner)));
    }
  }

  return blocks;
};

export const htmlToBlocks = (html: string): ContentBlock[] => {
  const blocks = parseBlocks((html ?? '').trim());
  // 서버는 빈 본문을 받지 않는다. 최소한 빈 문단 하나는 남긴다.
  return blocks.length > 0 ? blocks : [block('paragraph', [])];
};

const inlineToHtml = (
  content: BlockInlineContent[] | string | undefined,
): string => {
  if (typeof content === 'string') return escapeHtml(content);
  if (!Array.isArray(content)) return '';

  return content
    .map(item => {
      if (item?.type === 'link') {
        const href = escapeHtml(item.href ?? '');
        return `<a href="${href}">${inlineToHtml(item.content)}</a>`;
      }

      const styles = item?.styles ?? {};
      let html = escapeHtml(item?.text ?? '').replace(/\n/g, '<br>');
      if (styles.code) html = `<code>${html}</code>`;
      if (styles.strike) html = `<s>${html}</s>`;
      if (styles.underline) html = `<u>${html}</u>`;
      if (styles.italic) html = `<em>${html}</em>`;
      if (styles.bold) html = `<strong>${html}</strong>`;
      return html;
    })
    .join('');
};

const LIST_WRAPPER: Record<string, string> = {
  bulletListItem: 'ul',
  numberedListItem: 'ol',
  checkListItem: 'ul',
};

export const blocksToHtml = (blocks: ContentBlock[] | null | undefined) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  const out: string[] = [];
  let openList: string | null = null;
  const closeList = () => {
    if (openList) {
      out.push(`</${openList}>`);
      openList = null;
    }
  };

  blocks.forEach(item => {
    const type = item?.type ?? 'paragraph';
    const wrapper = LIST_WRAPPER[type];

    if (wrapper) {
      // 같은 갈래가 이어지는 동안에는 목록 하나로 묶는다.
      const tag = type === 'checkListItem' ? 'ul data-type="taskList"' : wrapper;
      if (openList !== wrapper) {
        closeList();
        out.push(`<${tag}>`);
        openList = wrapper;
      }
      const checked = type === 'checkListItem';
      const attrs = checked
        ? ` data-checked="${item.props?.checked ? 'true' : 'false'}"`
        : '';
      out.push(
        `<li${attrs}><p>${inlineToHtml(item.content)}</p>${blocksToHtml(
          item.children,
        )}</li>`,
      );
      return;
    }

    closeList();
    switch (type) {
      case 'heading': {
        const level = Math.min(Math.max(Number(item.props?.level ?? 1), 1), 3);
        out.push(`<h${level}>${inlineToHtml(item.content)}</h${level}>`);
        break;
      }
      case 'quote':
      case 'blockquote':
        out.push(`<blockquote><p>${inlineToHtml(item.content)}</p></blockquote>`);
        break;
      case 'divider':
      case 'separator':
        out.push('<hr>');
        break;
      case 'image': {
        const src = escapeHtml(String(item.props?.url ?? ''));
        out.push(src ? `<img src="${src}">` : '<p></p>');
        break;
      }
      default:
        out.push(`<p>${inlineToHtml(item.content)}</p>`);
    }
  });

  closeList();
  return out.join('');
};
