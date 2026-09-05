import React, { useCallback } from 'react';
import FastImage, { ImageStyle } from 'react-native-fast-image';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StyleProp,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Copy from 'lucide-react-native/dist/esm/icons/copy';
import { EmptyState } from '../../../components/ui';
import FallbackImage from '../../../components/common/FallbackImage';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export interface TravelFeedItem {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  authorLevel: number;
  thumbnailUrl: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: number;
  views: number;
  forks: number;
  tags: string[];
  location: string;
  duration: string;
  /** 첫날 코스. 목록 API가 placesByDay로 내려주는 값이다. */
  routePlaces: string[];
  /** 전체 장소 수. 첫날에서 잘린 나머지를 "외 N곳"으로 쓴다. */
  placeCount: number;
}

interface TravelFeedListProps {
  items: TravelFeedItem[];
  onItemPress?: (item: TravelFeedItem) => void;
  viewMode?: 'list' | 'grid';

  isLoading?: boolean;

  isLoadingMore?: boolean;
  isRefreshing?: boolean;

  isFiltered?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  /** 목록이 굴러간 세로 거리. 화면이 여행기 쓰기 단추를 접는 데 쓴다. */
  onScrollOffset?: (offsetY: number) => void;
}

// 화면이 좁아 네 곳까지만 들어간다. 나머지는 "외 N곳"으로 접는다.
const ROUTE_PREVIEW_MAX = 4;

const FeedAvatar = ({ uri, name }: { uri: string; name: string }) => (
  <FallbackImage
    uri={uri}
    style={styles.avatar}
    priority={FastImage.priority.low}
    fallback={
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{(name || '?').charAt(0)}</Text>
      </View>
    }
  />
);

const FeedThumbnail = ({
  uri,
  style,
}: {
  uri: string;
  style: StyleProp<ImageStyle>;
}) => (
  <FallbackImage
    uri={uri}
    style={style}
    fallback={<View style={[style, styles.thumbnailFallback]} />}
  />
);

/** 지역과 기간. 제목 위에 작게 올린다. */
const FeedKicker = ({ item }: { item: TravelFeedItem }) => {
  const text = [item.location, item.duration].filter(Boolean).join(' · ');
  if (!text) return null;
  return (
    <Text style={styles.kicker} numberOfLines={1}>
      {text}
    </Text>
  );
};

/**
 * 첫날 코스 한 줄.
 *
 * 지도 앱도 블로그도 못 보여주는 정보라 목록에서 앞세울 값이다.
 * 상세를 따로 부르지 않아도 목록 응답에 이미 들어 있다.
 */
const FeedRoute = ({ item }: { item: TravelFeedItem }) => {
  if (item.routePlaces.length === 0) return null;

  const shown = item.routePlaces.slice(0, ROUTE_PREVIEW_MAX);
  const rest = Math.max(0, item.placeCount - shown.length);

  return (
    <Text style={styles.route} numberOfLines={2}>
      <Text style={styles.routeDay}>DAY 1 </Text>
      {shown.map((place, index) => (
        <Text key={`${place}-${index}`}>
          {index > 0 ? <Text style={styles.routeArrow}> → </Text> : null}
          {place}
        </Text>
      ))}
      {rest > 0 ? (
        <Text>
          <Text style={styles.routeArrow}> → </Text>
          <Text style={styles.routeRest}>{`외 ${rest}곳`}</Text>
        </Text>
      ) : null}
    </Text>
  );
};

/** 작성자와 반응은 글자로만 두고, 가져간 수만 오른쪽에 세운다. */
const FeedByline = ({ item }: { item: TravelFeedItem }) => (
  <View style={styles.byline}>
    <View style={styles.bylineWho}>
      <FeedAvatar uri={item.authorAvatar} name={item.author} />
      <Text style={styles.bylineText} numberOfLines={1}>
        <Text style={styles.bylineAuthor}>{item.author}</Text>
        {` · 추천 ${item.likes} · 댓글 ${item.comments}`}
      </Text>
    </View>
    <View style={styles.fork}>
      <Copy
        size={normalize(13)}
        color={
          item.forks > 0 ? tokens.colors.primary : tokens.colors.textTertiary
        }
        strokeWidth={1.8}
      />
      <Text style={[styles.forkText, item.forks === 0 && styles.forkTextZero]}>
        {`가져감 ${item.forks}`}
      </Text>
    </View>
  </View>
);

const FeedListItem = React.memo(function FeedListItem({
  item,
  isGrid,
  onPress,
}: {
  item: TravelFeedItem;
  isGrid: boolean;
  onPress?: (item: TravelFeedItem) => void;
}) {
  const handlePress = useCallback(() => {
    if (onPress) onPress(item);
  }, [onPress, item]);

  // 격자 모드는 사진 위에 아무것도 얹지 않고 글자를 아래에 쌓는다.
  if (isGrid) {
    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <FeedThumbnail uri={item.thumbnailUrl} style={styles.hero} />
        <View style={styles.gridBody}>
          <FeedKicker item={item} />
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <FeedRoute item={item} />
          <FeedByline item={item} />
        </View>
      </Pressable>
    );
  }

  // 사진을 오른쪽 끝에 두면 키커·제목·설명·코스·바이라인의 왼쪽 끝이 하나로
  // 모인다. 사진을 왼쪽에 두면 코스 줄만 사진 아래에서 시작해 어긋나 보였다.
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.listRow}>
        <View style={styles.listColumn}>
          <FeedKicker item={item} />
          <Text style={styles.listTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <FeedThumbnail uri={item.thumbnailUrl} style={styles.listThumbnail} />
      </View>
      <FeedRoute item={item} />
      <FeedByline item={item} />
    </Pressable>
  );
});

export default function TravelFeedList({
  items,
  onItemPress,
  viewMode = 'list',
  isLoading = false,
  isLoadingMore = false,
  isRefreshing = false,
  isFiltered = false,
  onRefresh,
  onLoadMore,
  onScrollOffset,
}: TravelFeedListProps) {
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollOffset?.(event.nativeEvent.contentOffset.y);
    },
    [onScrollOffset],
  );

  const renderItem = useCallback(
    ({ item }: { item: TravelFeedItem }) => (
      <FeedListItem
        item={item}
        isGrid={viewMode === 'grid'}
        onPress={onItemPress}
      />
    ),
    [onItemPress, viewMode],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={tokens.colors.primary} />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <EmptyState title="여행기를 불러오는 중…" loading />;
    }
    return (
      <EmptyState
        title={
          isFiltered ? '조건에 맞는 여행기가 없어요' : '등록된 여행기가 없어요'
        }
        description={
          isFiltered
            ? '필터를 조정하면 더 많은 여행기를 볼 수 있어요.'
            : '첫 여행기를 써 보세요.'
        }
      />
    );
  }, [isLoading, isFiltered]);

  return (
    <View style={styles.container}>
      <FlashList
        key={viewMode}
        numColumns={1}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[tokens.colors.primary]}
            tintColor={tokens.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  listContent: {
    paddingBottom: normalize(12),
  },

  // 카드 테두리 대신 전체 폭 구분선 하나로 나눈다.
  item: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  itemPressed: {
    backgroundColor: tokens.colors.surface,
  },

  listRow: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  listColumn: {
    flex: 1,
    minWidth: 0,
  },
  // 여행 사진은 대부분 가로다. 정사각으로 자르면 풍경이 잘린다.
  listThumbnail: {
    width: normalize(92),
    height: normalize(69),
    borderRadius: normalize(8),
    backgroundColor: tokens.colors.surface,
  },
  listTitle: {
    fontSize: normalize(15.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    lineHeight: normalize(21),
    letterSpacing: -0.3,
  },

  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: normalize(10),
    backgroundColor: tokens.colors.surface,
  },
  gridBody: {
    marginTop: normalize(11),
  },
  gridTitle: {
    fontSize: normalize(17),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    lineHeight: normalize(23),
    letterSpacing: -0.3,
  },

  kicker: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
    marginBottom: normalize(3),
  },
  // 설명이 한 줄이거나 아예 없어도 두 줄 자리를 지킨다. 그래야 카드마다
  // 코스 줄과 작성자 줄이 같은 높이에서 시작한다.
  description: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    lineHeight: normalize(19),
    height: normalize(19) * 2,
    marginTop: normalize(4),
  },

  route: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
    lineHeight: normalize(18),
    marginTop: normalize(8),
  },
  routeDay: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  routeArrow: {
    color: tokens.colors.borderStrong,
  },
  routeRest: {
    color: tokens.colors.textTertiary,
  },

  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(8),
    marginTop: normalize(11),
  },
  bylineWho: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    minWidth: 0,
  },
  bylineText: {
    flex: 1,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  bylineAuthor: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
  },
  avatar: {
    width: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    backgroundColor: tokens.colors.border,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: normalize(9),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  thumbnailFallback: {
    backgroundColor: tokens.colors.surface,
  },

  fork: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  forkText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  forkTextZero: {
    color: tokens.colors.textTertiary,
  },

  footerLoading: {
    paddingVertical: normalize(20),
    alignItems: 'center',
  },
});
