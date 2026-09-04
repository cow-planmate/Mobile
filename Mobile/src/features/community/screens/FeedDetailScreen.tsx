import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CalendarIcon from 'lucide-react-native/dist/esm/icons/calendar';
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ChevronUp from 'lucide-react-native/dist/esm/icons/chevron-up';
import Copy from 'lucide-react-native/dist/esm/icons/copy';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import ThumbsDown from 'lucide-react-native/dist/esm/icons/thumbs-down';
import ThumbsUp from 'lucide-react-native/dist/esm/icons/thumbs-up';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { CalendarModal } from '../../../components/common';
import { FeedStackParamList } from '../../../navigation/types';
import {
  usePost,
  useReactToPost,
  useForkItinerary,
  useSimilarFeedPosts,
} from '../hooks/queries';
import { formatDuration } from '../services/communityApi';
import { canForkItinerary } from '../utils/itineraryToPlan';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import { resolveAvatarUrl } from '../utils/avatar';
import PostContentView from '../components/PostContentView';
import CommentSection from '../components/CommentSection';
import UserAvatar from '../../../components/common/UserAvatar';
import FallbackImage from '../../../components/common/FallbackImage';
import PublicProfileModal from '../components/PublicProfileModal';
import { ReactionType } from '../types';
import { ScheduleTimeline } from '../../itinerary/components/PlanScheduleList';
import {
  ALL_DAYS,
  countPlaces,
  itineraryEntries,
} from '../utils/itineraryEntries';
import { styles, COLORS } from './FeedDetailScreen.styles';
import { tokens } from '../../../theme/tokens';
import { useScreenInsets } from '../../../hooks/useScreenInsets';

type FeedDetailRoute = RouteProp<FeedStackParamList, 'FeedDetail'>;


export default function FeedDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<FeedDetailRoute>();
  const { showAlert } = useAlert();

  const postId = route.params?.postId;
  const screenInsets = useScreenInsets(false);
  const user = useAuthStore(state => state.user);
  const isLoggedIn = !!user;

  const [isAuthorProfileVisible, setAuthorProfileVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isScheduleOpen, setScheduleOpen] = useState(true);
  const [isDateModalVisible, setDateModalVisible] = useState(false);

  const { data: post, isLoading, isError } = usePost(postId, true);
  const react = useReactToPost(postId ?? '', true);
  const fork = useForkItinerary(postId ?? '');
  const isAuthor = !!post && user?.userId === post.userId;

  const days = useMemo(() => post?.itinerary?.days ?? [], [post]);
  const totalPlaces = useMemo(() => countPlaces(days), [days]);
  const entries = useMemo(
    () => itineraryEntries(days, selectedDay),
    [days, selectedDay],
  );
  const isForkable = canForkItinerary(post?.itinerary);

  const similarRegion = post?.location ?? post?.region ?? undefined;
  const { data: similarPosts = [] } = useSimilarFeedPosts(similarRegion, postId);
  const reactionLock = useSubmitLock();

  const handleReact = (type: ReactionType) =>
    reactionLock.runExclusive(async () => {
      if (!isLoggedIn) {
        showAlert({ title: '로그인 필요', message: '로그인 후 이용할 수 있어요.' });
        return;
      }
      try {
        await react.mutateAsync(type);
      } catch (error) {
        showAlert({
          title: '반응 등록 실패',
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    });

  const forkLock = useSubmitLock();

  const handleForkPress = () => {
    if (!isLoggedIn) {
      showAlert({
        title: '로그인 필요',
        message: '가져가려면 로그인이 필요해요.',
      });
      return;
    }
    setDateModalVisible(true);
  };

  const handleForkConfirm = ({ startDate }: { startDate: Date }) =>
    forkLock.runExclusive(async () => {
      setDateModalVisible(false);
      if (!post?.itinerary) return;

      try {
        const { planId, adjustedBlocks } = await fork.mutateAsync({
          itinerary: post.itinerary,
          startDate,
          title: post.title,
        });

        showAlert({
          title: '가져오기 완료',
          message:
            adjustedBlocks > 0
              ? `내 일정에 담았어요. 시간이 겹치는 블록 ${adjustedBlocks}개는 뒤로 밀어 정리했어요.`
              : '내 일정에 담았어요.',
          type: 'success',
          buttons: [
            { text: '닫기', style: 'cancel' },
            {
              text: '일정 보기',
              onPress: () =>
                navigation.navigate('ItineraryEditor', {
                  planId: String(planId),
                }),
            },
          ],
        });
      } catch (error) {
        showAlert({
          title: '가져오기 실패',
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    });

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.topBarButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        hitSlop={8}
      >
        <ChevronLeft size={normalize(22)} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.topBarTitle}>여행기</Text>
      {isAuthor ? (
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => navigation.navigate('FeedCreate', { postId: String(post.id) })}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="글 수정"
          hitSlop={8}
        >
          <Pencil size={normalize(18)} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.topBarButton} />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, screenInsets]}>
        {renderTopBar()}
        <View style={styles.stateBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.stateText}>여행기를 불러오는 중…</Text>
        </View>
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={[styles.container, screenInsets]}>
        {renderTopBar()}
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            여행기를 찾을 수 없어요.{'\n'}삭제됐거나 접근할 수 없는 글이에요.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.stateLink}>목록으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 작성 화면이 빈 본문을 제목으로 채운다(content.trim() || title.trim()).
  // 그대로 그리면 제목 바로 아래에 같은 문장이 한 번 더 적힌다.
  const bodyText = (post.contentText ?? '').trim();
  const hasBody = bodyText.length > 0 && bodyText !== post.title.trim();

  const renderReactions = () => (
    <View style={styles.reactionRow}>
      <TouchableOpacity
        style={[
          styles.reactionButton,
          post.myReaction === 'like' && styles.reactionButtonActive,
        ]}
        onPress={() => handleReact('like')}
        activeOpacity={0.85}
        disabled={react.isPending || reactionLock.isSubmitting}
        accessibilityState={{
          disabled: react.isPending || reactionLock.isSubmitting,
        }}
      >
        <ThumbsUp
          size={normalize(14)}
          color={
            post.myReaction === 'like' ? COLORS.white : COLORS.textSecondary
          }
        />
        <Text
          style={[
            styles.reactionText,
            post.myReaction === 'like' && styles.reactionTextActive,
          ]}
        >
          좋아요 {post.likes.toLocaleString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.reactionButton,
          post.myReaction === 'dislike' &&
            styles.reactionButtonActiveDislike,
        ]}
        onPress={() => handleReact('dislike')}
        activeOpacity={0.85}
        disabled={react.isPending || reactionLock.isSubmitting}
        accessibilityState={{
          disabled: react.isPending || reactionLock.isSubmitting,
        }}
      >
        <ThumbsDown
          size={normalize(14)}
          color={
            post.myReaction === 'dislike'
              ? COLORS.white
              : COLORS.textSecondary
          }
        />
        <Text
          style={[
            styles.reactionText,
            post.myReaction === 'dislike' && styles.reactionTextActive,
          ]}
        >
          싫어요 {post.dislikes}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const durationLabel = formatDuration(post.durationDays);
  const regionLabel = post.location ?? post.region;

  return (
    <View style={[styles.container, screenInsets]}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.white} />
      {renderTopBar()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        <View style={styles.band} />

        <View style={styles.block}>
        {/* 큰 사진을 머리에 얹으면 제목과 여행 정보가 첫 화면 밖으로 밀린다.
            사진은 목록과 아래 장소 줄에서 이미 보이므로 여기서는 글로만 열다. */}
        <View style={styles.header}>
          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.metaRow}>
            <TouchableOpacity
              style={styles.authorTouchable}
              onPress={() => setAuthorProfileVisible(true)}
              activeOpacity={0.7}
              hitSlop={6}
            >
              <UserAvatar
                name={post.author}
                imageUrl={resolveAvatarUrl(post.authorImage, post.authorAvatarHash)}
                size={normalize(22)}
              />
              <Text style={styles.metaAuthor}>{post.author}</Text>
            </TouchableOpacity>
            {/* 웹과 같은 짜임: 이름 | 지역 · 기간.
                작성자와 여행 정보는 성격이 달라 세로선으로 끊고,
                지역과 기간은 한 덩이라 가운뎃점으로 잇는다. */}
            {(!!regionLabel || !!durationLabel) && (
              <View style={styles.metaRule} />
            )}
            {!!regionLabel && (
              <View style={styles.metaFact}>
                <MapPin
                  size={normalize(13)}
                  color={COLORS.primary}
                  strokeWidth={2}
                />
                <Text style={styles.metaRegion}>{regionLabel}</Text>
              </View>
            )}
            {!!regionLabel && !!durationLabel && (
              <Text style={styles.metaDivider}>·</Text>
            )}
            {!!durationLabel && (
              <View style={styles.metaFact}>
                <CalendarIcon
                  size={normalize(13)}
                  color={COLORS.textLabel}
                  strokeWidth={2}
                />
                <Text style={styles.metaDuration}>{durationLabel}</Text>
              </View>
            )}
          </View>

          <Text style={styles.metaText}>
            {post.createdAt} · 조회 {post.views.toLocaleString()} · 가져감{' '}
            {post.forks ?? 0}
          </Text>

          {(post.tags ?? []).length > 0 && (
            <Text style={styles.tagLine}>
              {(post.tags ?? []).map(tag => `#${tag}`).join('  ')}
            </Text>
          )}
        </View>

        {hasBody && (
          <View style={styles.body}>
            <PostContentView
              content={post.content}
              contentText={post.contentText}
            />
          </View>
        )}
        </View>

        {days.length > 0 && (
          <>
          <View style={styles.band} />
          <View style={[styles.block, styles.section]}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setScheduleOpen(!isScheduleOpen)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ expanded: isScheduleOpen }}
            >
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionTitle}>상세 일정</Text>
                <Text style={styles.sectionSubtitle}>
                  총 {totalPlaces}개의 장소
                </Text>
              </View>
              {isScheduleOpen ? (
                <ChevronUp size={normalize(18)} color={COLORS.textSecondary} />
              ) : (
                <ChevronDown size={normalize(18)} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>

            {isScheduleOpen && (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayTabs}
                >
                  {/* 며칠짜리인지, 흐름이 어떤지는 하루씩 봐서는 안 잡힌다. */}
                  {days.length > 1 && (
                    <TouchableOpacity
                      style={[
                        styles.dayTab,
                        selectedDay === ALL_DAYS && styles.dayTabActive,
                      ]}
                      onPress={() => setSelectedDay(ALL_DAYS)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.dayTabText,
                          selectedDay === ALL_DAYS && styles.dayTabTextActive,
                        ]}
                      >
                        전체
                      </Text>
                    </TouchableOpacity>
                  )}
                  {days.map((day, index) => {
                    const isActive = selectedDay === index;
                    return (
                      <TouchableOpacity
                        key={day.day ?? index}
                        style={[styles.dayTab, isActive && styles.dayTabActive]}
                        onPress={() => setSelectedDay(index)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.dayTabText,
                            isActive && styles.dayTabTextActive,
                          ]}
                        >
                          Day {day.day ?? index + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <ScheduleTimeline
                  entries={entries}
                  emptyText="이 날에는 등록된 장소가 없어요"
                  showMapLink
                  // 전체를 고르면 마지막 줄이 마지막 날의 끝이라 '하루'로 닫을 수 없다.
                  endLabel={
                    selectedDay === ALL_DAYS ? undefined : '하루 마무리'
                  }
                />
              </>
            )}

            {/* 좋아요·싫어요와 가져가기를 일정 아래 한 칸에 모은다. 셋 다 이 일정을
                다 보고 나서 하는 일이라, 흩어 두면 훑다 말고 되돌아가야 한다. */}
            <View style={styles.actionBar}>{renderReactions()}</View>

            <View style={styles.forkBar}>
              <TouchableOpacity
                style={[
                  styles.forkButton,
                  (!isForkable || fork.isPending) && styles.forkButtonDisabled,
                ]}
                onPress={handleForkPress}
                disabled={!isForkable || fork.isPending}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isForkable || fork.isPending }}
              >
                <Copy
                  size={normalize(15)}
                  color={isForkable ? COLORS.white : COLORS.textTertiary}
                />
                <Text
                  style={[
                    styles.forkButtonText,
                    !isForkable && styles.forkButtonTextOff,
                  ]}
                >
                  {!isForkable
                    ? '가져갈 일정이 없어요'
                    : fork.isPending
                    ? '가져오는 중…'
                    : '내 일정으로 가져가기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          </>
        )}

        {days.length === 0 && (
          <>
            <View style={styles.band} />
            {/* 일정이 없는 여행기도 좋아요·싫어요는 눌릴 수 있어야 한다. */}
            <View style={styles.block}>
              <View style={styles.loneActionBar}>{renderReactions()}</View>
            </View>
          </>
        )}

        <View style={styles.band} />

        <View
          style={[
            styles.block,
            similarPosts.length === 0 && styles.blockFill,
          ]}
        >
          <CommentSection postId={post.id} commentCount={post.comments} feed />
        </View>

        {similarPosts.length > 0 && (
          <>
            <View style={styles.band} />

            <View style={[styles.block, styles.blockFill]}>
              <Text style={styles.similarHeading}>
                {regionLabel}의 다른 여행기
              </Text>
              <Text style={styles.similarSubtitle}>
                추천이 많은 순으로 보여드려요
              </Text>
              {similarPosts.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarRow}
                  onPress={() =>
                    // push면 여행기를 타고 넘어갈 때마다 스택이 쌓인다.
                    navigation.replace('FeedDetail', { postId: String(item.id) })
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <FallbackImage
                    uri={item.image}
                    style={styles.similarThumb}
                    fallback={
                      <View style={[styles.similarThumb, styles.similarThumbEmpty]}>
                        <MapPin
                          size={normalize(16)}
                          color={COLORS.borderStrong}
                          strokeWidth={1.8}
                        />
                      </View>
                    }
                  />
                  <View style={styles.similarBody}>
                    <Text style={styles.similarTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.similarMeta} numberOfLines={1}>
                      {[formatDuration(item.durationDays), item.author]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                    <Text style={styles.similarCounts}>
                      추천 {item.likes} · 가져감 {item.forks ?? 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <PublicProfileModal
        visible={isAuthorProfileVisible}
        onClose={() => setAuthorProfileVisible(false)}
        userId={post.userId ?? null}
        fallbackName={post.author}
      />

      <CalendarModal
        visible={isDateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onConfirm={handleForkConfirm}
      />
    </View>
  );
}
