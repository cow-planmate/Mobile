import React, { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CalendarDays from 'lucide-react-native/dist/esm/icons/calendar-days';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle';
import ThumbsUp from 'lucide-react-native/dist/esm/icons/thumbs-up';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';
import Badge from './Badge';
import Card from './Card';
import Chip from './Chip';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import StatRow, { StatItem } from './StatRow';
import UnderlineTabs from './UnderlineTabs';

const REGIONS = ['전체', '제주', '부산', '강릉', '여수'];
const SORTS = ['최신순', '추천순', '조회순'];
const BOARDS = [
  { key: 'free', label: '자유게시판' },
  { key: 'qna', label: 'Q&A' },
  { key: 'mate', label: '메이트 찾기' },
  { key: 'recommend', label: '장소 추천' },
];

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PrimitivesPreview() {
  const [region, setRegion] = useState('제주');
  const [sort, setSort] = useState('최신순');
  const [board, setBoard] = useState('free');
  const [liked, setLiked] = useState(false);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Group title="UnderlineTabs">
        <UnderlineTabs items={BOARDS} selectedKey={board} onSelect={setBoard} />
      </Group>

      <Group title="Chip / solid">
        <View style={styles.row}>
          {SORTS.map(item => (
            <Chip
              key={item}
              label={item}
              size="s"
              selected={sort === item}
              onPress={() => setSort(item)}
            />
          ))}
        </View>
      </Group>

      <Group title="Chip / soft">
        <View style={styles.row}>
          {REGIONS.map((item, index) => (
            <Chip
              key={item}
              label={item}
              variant="soft"
              count={index === 0 ? undefined : 12 - index * 2}
              selected={region === item}
              onPress={() => setRegion(item)}
            />
          ))}
        </View>
      </Group>

      <Group title="Badge">
        <View style={styles.row}>
          <Badge label="HOT" tone="hot" />
          <Badge label="답변완료" tone="success" />
          <Badge label="답변대기" tone="neutral" />
          <Badge label="모집중 2/4" tone="mate" />
          <Badge
            label="성산일출봉"
            tone="place"
            icon={<MapPin size={9} color={tokens.tones.place.fg} />}
          />
          <Badge label="4.8" tone="rating" />
        </View>
      </Group>

      <Group title="Card / elevated">
        <Card>
          <SectionHeader
            title="여행 상세 일정"
            count={3}
            icon={<CalendarDays size={18} color={tokens.colors.primary} />}
          />
          <Text style={styles.body}>
            제주에서의 3일. 성산일출봉에서 시작해 서귀포로 내려가는 동선입니다.
          </Text>
          <StatRow>
            <StatItem
              icon={
                <ThumbsUp
                  size={13}
                  color={liked ? tokens.colors.primary : tokens.colors.textSecondary}
                />
              }
              value={128}
              label="좋아요"
              active={liked}
              onPress={() => setLiked(prev => !prev)}
            />
            <StatItem
              icon={<MessageCircle size={13} color={tokens.colors.textSecondary} />}
              value={24}
              label="댓글"
            />
            <StatItem
              icon={<Eye size={13} color={tokens.colors.textSecondary} />}
              value={1840}
              label="조회"
            />
          </StatRow>
        </Card>
      </Group>

      <Group title="Card / outlined + flat">
        <Card variant="outlined" padding="s">
          <Text style={styles.bodyTight}>outlined · padding s</Text>
        </Card>
        <Card variant="flat" padding="l">
          <Text style={styles.bodyTight}>flat · padding l</Text>
        </Card>
      </Group>

      <Group title="SectionHeader / description">
        <SectionHeader
          title="가져가는 여행기"
          description="마음에 드는 일정을 가져가고 나만의 여행으로 만들어보세요."
          icon={<MapPin size={18} color={tokens.colors.primary} />}
        />
      </Group>

      <Group title="EmptyState">
        <EmptyState
          title="아직 게시글이 없어요"
          description="첫 글을 작성해보세요."
          actionLabel="글쓰기"
          onAction={action('onAction')}
        />
      </Group>

      <Group title="EmptyState / loading">
        <EmptyState title="여행기를 불러오는 중..." loading />
      </Group>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  content: {
    padding: normalize(16),
    paddingBottom: normalize(48),
    gap: normalize(24),
  },
  group: {
    gap: normalize(10),
  },
  groupTitle: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textTertiary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  body: {
    marginTop: normalize(8),
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  bodyTight: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
});

const meta: Meta<typeof PrimitivesPreview> = {
  title: '01. 공통/01. UI 프리미티브',
  component: PrimitivesPreview,
};

export default meta;

type Story = StoryObj<typeof PrimitivesPreview>;

export const Default: Story = { name: '기본' };
