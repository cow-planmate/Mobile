import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bone, Skeleton } from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

const POST_ROWS = 6;
const FEED_CARDS = 3;
const BODY_LINES = [100, 96, 100, 72, 90, 48] as const;

/** 게시판 목록의 글 한 줄 모양. 제목, 글쓴이 줄 순이고 일부 글은 오른쪽에 사진이 붙는다. */
export function PostListSkeleton() {
  return (
    <Skeleton label="게시글을 불러오는 중">
      {Array.from({ length: POST_ROWS }, (_, index) => (
        <View key={index} style={styles.postRow}>
          <View style={styles.postLeft}>
            <Bone width={index % 2 === 0 ? '78%' : '52%'} height={16} />
            <View style={styles.inline}>
              <Bone width={20} height={20} radius={10} />
              <Bone width={170} height={11} />
            </View>
          </View>
          {/* 사진이 있는 글과 없는 글이 섞이는 목록이라 가끔만 둔다. */}
          {index % 3 === 1 && <Bone width={72} height={72} radius={10} />}
        </View>
      ))}
    </Skeleton>
  );
}

/** 여행기 목록의 카드 모양. 목록 보기는 글자 뒤에 사진, 격자 보기는 큰 사진 아래 글자다. */
export function FeedListSkeleton({ isGrid = false }: { isGrid?: boolean }) {
  return (
    <Skeleton label="여행기를 불러오는 중">
      {Array.from({ length: FEED_CARDS }, (_, index) => (
        <View key={index} style={styles.feedCard}>
          {isGrid ? (
            <>
              <Bone
                width="100%"
                height={0}
                radius={10}
                style={styles.feedHero}
              />
              <View style={styles.feedBody}>
                <Bone width={60} height={10} />
                <Bone width="86%" height={17} />
                <Bone width="95%" height={11} />
              </View>
            </>
          ) : (
            <View style={styles.feedRow}>
              <View style={styles.feedColumn}>
                <Bone width={60} height={10} />
                <Bone width="94%" height={16} />
                <Bone width="70%" height={16} />
                <Bone width="88%" height={11} />
                <Bone width="55%" height={11} />
              </View>
              <Bone width={92} height={69} radius={8} />
            </View>
          )}
          <Bone width="95%" height={11} style={styles.feedRoute} />
          <View style={styles.byline}>
            <View style={styles.inline}>
              <Bone width={18} height={18} radius={9} />
              <Bone width={140} height={11} />
            </View>
            <Bone width={60} height={11} />
          </View>
        </View>
      ))}
    </Skeleton>
  );
}

/** 게시글·여행기 상세 본문 모양. 종류 표시, 제목, 글쓴이, 본문 줄, 사진 자리 순이다. */
export function DetailSkeleton({ label }: { label: string }) {
  return (
    <Skeleton
      label={label}
      style={styles.detail}
      contentStyle={styles.detailBody}
    >
      <Bone width={36} height={14} />
      <Bone width="96%" height={20} />
      <Bone width="66%" height={20} />
      <View style={styles.author}>
        <Bone width={28} height={28} radius={14} />
        <View style={styles.authorText}>
          <Bone width={80} height={11} />
          <Bone width={120} height={10} />
        </View>
      </View>
      <View style={styles.divider} />
      {BODY_LINES.map((width, index) => (
        <Bone key={index} width={`${width}%`} height={12} />
      ))}
      <Bone width="100%" height={180} radius={10} />
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  postRow: {
    flexDirection: 'row',
    gap: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  postLeft: {
    flex: 1,
    gap: normalize(8),
  },
  feedCard: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  feedRow: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  feedColumn: {
    flex: 1,
    gap: normalize(7),
  },
  feedHero: {
    height: undefined,
    aspectRatio: 16 / 9,
  },
  feedBody: {
    marginTop: normalize(11),
    gap: normalize(7),
  },
  feedRoute: {
    marginTop: normalize(10),
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(8),
    marginTop: normalize(11),
  },
  detail: {
    flex: 1,
    padding: normalize(16),
    backgroundColor: tokens.colors.white,
  },
  detailBody: {
    gap: normalize(10),
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    marginTop: normalize(4),
  },
  authorText: {
    gap: normalize(5),
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.borderLight,
    marginVertical: normalize(14),
  },
});
