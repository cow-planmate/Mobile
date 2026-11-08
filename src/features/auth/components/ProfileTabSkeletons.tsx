import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bone, Skeleton } from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

const PLAN_ROWS = 4;
const ACTIVITY_ROWS = 3;

/** 활동 줄 하나. 글은 분류·날짜, 제목, 반응 수 순이고 댓글은 글 제목, 내용, 날짜 순이다. */
function ActivityRow({ variant }: { variant: 'post' | 'comment' }) {
  if (variant === 'comment') {
    return (
      <View style={styles.activityRow}>
        <Bone width="70%" height={14} />
        <Bone width="92%" height={11} />
        <Bone width={60} height={10} />
      </View>
    );
  }
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityMeta}>
        <Bone width={28} height={10} />
        <Bone width={52} height={10} />
      </View>
      <Bone width="82%" height={14} />
      <Bone width={64} height={10} />
    </View>
  );
}

/** 작성한 글·댓글 목록이 뜨는 자리(카드 안쪽)에 넣는 줄 뼈대. */
export function ActivityRowsSkeleton({
  variant = 'post',
  count = ACTIVITY_ROWS,
}: {
  variant?: 'post' | 'comment';
  count?: number;
}) {
  return (
    <Skeleton label="활동을 불러오는 중">
      {Array.from({ length: count }, (_, index) => (
        <ActivityRow key={index} variant={variant} />
      ))}
    </Skeleton>
  );
}

/** 마이페이지 여행 일정 탭의 뼈대. 제목 줄, 안쪽 탭, 일정 줄 순이다. */
export function ProfileTravelSkeleton() {
  return (
    <Skeleton label="여행 일정을 불러오는 중" style={styles.tab}>
      <View style={styles.sectionHeader}>
        <Bone width={132} height={18} />
        <Bone width={62} height={26} radius={8} />
      </View>

      <View style={styles.innerTabs}>
        <Bone width={78} height={14} />
        <Bone width={70} height={14} />
      </View>

      {Array.from({ length: PLAN_ROWS }, (_, index) => (
        <View key={index} style={styles.planRow}>
          <View style={styles.planDate}>
            <Bone width={32} height={16} />
            <Bone width={26} height={10} />
          </View>
          <View style={styles.planBody}>
            <Bone width={48} height={20} radius={8} />
            <Bone width={130} height={17} />
            <Bone width={56} height={11} />
          </View>
        </View>
      ))}
    </Skeleton>
  );
}

/** 마이페이지 커뮤니티 활동 탭의 뼈대. 나의 여행기 카드와 커뮤니티 활동 카드 두 덩어리다. */
export function ProfileStoriesSkeleton() {
  const block = (titleWidth: number, key: string) => (
    <View key={key}>
      <View style={styles.cardHeader}>
        <Bone width={titleWidth} height={16} />
      </View>
      <View style={styles.innerTabs}>
        <Bone width={66} height={14} />
        <Bone width={66} height={14} />
      </View>
      <View style={styles.cardBody}>
        {Array.from({ length: ACTIVITY_ROWS }, (_, index) => (
          <ActivityRow key={index} variant="post" />
        ))}
      </View>
    </View>
  );

  return (
    <Skeleton label="커뮤니티 활동을 불러오는 중" style={styles.tab}>
      {block(84, 'logs')}
      <View style={styles.band} />
      {block(100, 'community')}
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(17),
  },
  innerTabs: {
    flexDirection: 'row',
    gap: normalize(20),
    marginTop: normalize(11),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(14),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  planDate: {
    width: normalize(40),
    gap: normalize(6),
  },
  planBody: {
    flex: 1,
    gap: normalize(6),
  },
  cardHeader: {
    padding: normalize(16),
    paddingBottom: normalize(12),
  },
  cardBody: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(8),
  },
  activityRow: {
    gap: normalize(6),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  band: {
    height: normalize(20),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.pageGround,
  },
});
