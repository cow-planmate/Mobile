import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';
import { BlockInlineContent, ContentBlock } from '../types';
import { asBlocks, inlineToText } from '../utils/blocks';
import { isUnreachableHostUrl } from '../utils/avatar';
import { openExternalUrl } from '../../../utils/externalLink';

interface PostContentViewProps {
  content: unknown;
  contentText?: string;
}

const VISUAL_BLOCK_TYPES = new Set(['image', 'divider', 'separator']);

const openLink = (href?: string) => {
  openExternalUrl(href);
};

function InlineContent({
  content,
}: {
  content: BlockInlineContent[] | string | undefined;
}) {
  if (typeof content === 'string') {
    return <>{content}</>;
  }
  if (!Array.isArray(content)) {
    return null;
  }

  return (
    <>
      {content.map((item, index) => {
        if (item?.type === 'link') {
          return (
            <Text
              key={index}
              style={styles.link}
              onPress={() => openLink(item.href)}
            >
              <InlineContent content={item.content} />
            </Text>
          );
        }

        const text = item?.text ?? '';
        if (!text) return null;

        const inlineStyles = item?.styles ?? {};
        return (
          <Text
            key={index}
            style={[
              inlineStyles.bold && styles.bold,
              inlineStyles.italic && styles.italic,
              inlineStyles.underline && styles.underline,
              inlineStyles.strike && styles.strike,
              inlineStyles.code && styles.inlineCode,
            ]}
          >
            {text}
          </Text>
        );
      })}
    </>
  );
}

function BlockItem({
  block,
  ordinal,
  depth,
}: {
  block: ContentBlock;

  ordinal: number;
  depth: number;
}) {
  const type = block?.type ?? 'paragraph';
  const children = Array.isArray(block?.children) ? block.children : [];

  const renderBody = () => {
    switch (type) {
      case 'heading': {
        const level = Math.min(Math.max(block.props?.level ?? 1, 1), 3);
        const headingStyle =
          level === 1
            ? styles.heading1
            : level === 2
            ? styles.heading2
            : styles.heading3;
        return (
          <Text style={[styles.block, headingStyle]}>
            <InlineContent content={block.content} />
          </Text>
        );
      }

      case 'bulletListItem':
        return (
          <View style={styles.listRow}>
            <Text style={styles.listMarker}>•</Text>
            <Text style={[styles.block, styles.listText]}>
              <InlineContent content={block.content} />
            </Text>
          </View>
        );

      case 'numberedListItem':
        return (
          <View style={styles.listRow}>
            <Text style={styles.listMarker}>{ordinal}.</Text>
            <Text style={[styles.block, styles.listText]}>
              <InlineContent content={block.content} />
            </Text>
          </View>
        );

      case 'checkListItem':
        return (
          <View style={styles.listRow}>
            <Text style={styles.listMarker}>
              {block.props?.checked ? '☑' : '☐'}
            </Text>
            <Text
              style={[
                styles.block,
                styles.listText,
                block.props?.checked === true && styles.checked,
              ]}
            >
              <InlineContent content={block.content} />
            </Text>
          </View>
        );

      case 'quote':
      case 'blockquote':
        return (
          <View style={styles.quote}>
            <Text style={[styles.block, styles.quoteText]}>
              <InlineContent content={block.content} />
            </Text>
          </View>
        );

      case 'codeBlock':
        return (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{inlineToText(block.content)}</Text>
          </View>
        );

      case 'image': {
        const url = typeof block.props?.url === 'string' ? block.props.url : '';
        if (!url || isUnreachableHostUrl(url)) return null;
        const caption =
          typeof block.props?.caption === 'string' ? block.props.caption : '';
        return (
          <View style={styles.imageWrap}>
            <FastImage
              style={styles.image}
              source={{ uri: url }}
              resizeMode={FastImage.resizeMode.cover}
            />
            {!!caption && <Text style={styles.caption}>{caption}</Text>}
          </View>
        );
      }

      case 'divider':
      case 'separator':
        return <View style={styles.divider} />;

      default: {

        const text = inlineToText(block.content);
        if (!text) {
          if (VISUAL_BLOCK_TYPES.has(type)) return null;

          return <View style={styles.emptyLine} />;
        }
        return (
          <Text style={[styles.block, styles.paragraph]}>
            <InlineContent content={block.content} />
          </Text>
        );
      }
    }
  };

  const body = renderBody();

  if (!body && children.length === 0) {
    return null;
  }

  return (
    <View style={{ paddingLeft: depth * normalize(14) }}>
      {body}
      {children.length > 0 && <BlockList blocks={children} depth={depth + 1} />}
    </View>
  );
}

function BlockList({
  blocks,
  depth = 0,
}: {
  blocks: ContentBlock[];
  depth?: number;
}) {
  let ordinal = 0;

  return (
    <>
      {blocks.map((block, index) => {

        if (block?.type === 'numberedListItem') {
          ordinal += 1;
        } else {
          ordinal = 0;
        }

        return (
          <BlockItem
            key={block?.id ?? index}
            block={block}
            ordinal={ordinal}
            depth={depth}
          />
        );
      })}
    </>
  );
}

export default function PostContentView({
  content,
  contentText,
}: PostContentViewProps) {
  const blocks = asBlocks(content);

  if (!blocks) {
    return (
      <Text style={[styles.block, styles.paragraph]}>{contentText || ''}</Text>
    );
  }

  return (
    <View>
      <BlockList blocks={blocks} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  },
  paragraph: {
    fontSize: normalize(14),
    lineHeight: normalize(22),
    marginBottom: normalize(8),
  },
  emptyLine: {
    height: normalize(10),
  },

  heading1: {
    fontSize: normalize(20),
    lineHeight: normalize(28),
    fontFamily: theme.typography.fontFamily.bold,
    marginTop: normalize(6),
    marginBottom: normalize(8),
  },
  heading2: {
    fontSize: normalize(17),
    lineHeight: normalize(25),
    fontFamily: theme.typography.fontFamily.bold,
    marginTop: normalize(6),
    marginBottom: normalize(7),
  },
  heading3: {
    fontSize: normalize(15),
    lineHeight: normalize(23),
    fontFamily: theme.typography.fontFamily.semibold,
    marginTop: normalize(4),
    marginBottom: normalize(6),
  },

  bold: {
    fontFamily: theme.typography.fontFamily.bold,
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  inlineCode: {
    fontFamily: 'monospace',
    backgroundColor: theme.colors.borderLight,
    color: '#B91C1C',
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },

  listRow: {
    flexDirection: 'row',
    marginBottom: normalize(5),
  },
  listMarker: {
    minWidth: normalize(18),
    fontSize: normalize(14),
    lineHeight: normalize(22),
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  listText: {
    flex: 1,
    fontSize: normalize(14),
    lineHeight: normalize(22),
  },
  checked: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },

  quote: {
    borderLeftWidth: normalize(3),
    borderLeftColor: theme.colors.borderStrong,
    paddingLeft: normalize(10),
    marginBottom: normalize(10),
  },
  quoteText: {
    fontSize: normalize(14),
    lineHeight: normalize(22),
    color: theme.colors.textSecondary,
  },

  codeBlock: {
    backgroundColor: '#1F2937',
    borderRadius: theme.borderRadius.m,
    padding: normalize(12),
    marginBottom: normalize(10),
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: normalize(12),
    lineHeight: normalize(18),
    color: '#E5E7EB',
  },

  imageWrap: {
    marginBottom: normalize(12),
  },
  image: {
    width: '100%',
    height: normalize(200),
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.borderLight,
  },
  caption: {
    marginTop: normalize(5),
    fontSize: normalize(11),
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: normalize(14),
  },
});
