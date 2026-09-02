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
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ChevronUp from 'lucide-react-native/dist/esm/icons/chevron-up';
import Copy from 'lucide-react-native/dist/esm/icons/copy';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import ThumbsDown from 'lucide-react-native/dist/esm/icons/thumbs-down';
import ThumbsUp from 'lucide-react-native/dist/esm/icons/thumbs-up';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { CalendarModal } from '../../../components/common';
import { FeedStackParamList } from '../../../navigation/types';
import { usePost, useReactToPost, useForkItinerary } from '../hooks/queries';
import { formatDuration } from '../services/communityApi';
import { canForkItinerary } from '../utils/itineraryToPlan';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import { resolveAvatarUrl } from '../utils/avatar';
import PostContentView from '../components/PostContentView';
import CommentSection from '../components/CommentSection';
import UserAvatar from '../../../components/common/UserAvatar';
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

  const durationLabel = formatDuration(post.durationDays);
  const regionLabel = post.location ?? post.region;

  return (
    <View style={[styles.container, screenInsets]}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.white} />
      {renderTopBar()}

      <ScrollView showsVerticalScrollIndicator={false}>
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
            {!!regionLabel && (
              <>
                <Text style={styles.metaDivider}>·</Text>
                <Text style={styles.metaRegion}>{regionLabel}</Text>
              </>
            )}
            {!!durationLabel && (
              <>
                <Text style={styles.metaDivider}>·</Text>
                <Text style={styles.metaDuration}>{durationLabel}</Text>
              </>
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

        <View style={styles.forkBar}>
          <TouchableOpacity
            style={[
              styles.forkButton,
              (!isForkable || fork.isPending) && styles.forkButtonDisabled,
            ]}
            onPress={handleForkPress}
            disabled={!isForkable || fork.isPending}
            activeOpacity={0.85}
            accessibilityState={{ disabled: !isForkable || fork.isPending }}
          >
            <Copy size={normalize(15)} color={COLORS.white} />
            <Text style={styles.forkButtonText}>
              {fork.isPending ? '가져오는 중…' : '내 일정으로 가져가기'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.forkHint}>
            {isForkable
              ? '시작일만 고르면 이 일정 그대로 내 일정에 담겨요.'
              : '이 여행기에는 가져갈 수 있는 일정 정보가 없어요.'}
          </Text>
        </View>

        <View style={styles.body}>
          <PostContentView
            content={post.content}
            contentText={post.contentText}
          />
        </View>

        {days.length > 0 && (
          <View style={styles.section}>
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
                  {days.length}일 · 총 {totalPlaces}곳
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
                          {day.day ?? index + 1}일차
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <ScheduleTimeline
                  entries={entries}
                  emptyText="이 날에는 등록된 장소가 없어요"
                />
              </>
            )}
          </View>
        )}

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

        <CommentSection postId={post.id} commentCount={post.comments} feed />

      <PublicProfileModal
        visible={isAuthorProfileVisible}
        onClose={() => setAuthorProfileVisible(false)}
        userId={post.userId ?? null}
        fallbackName={post.author}
      />
      </ScrollView>

      <CalendarModal
        visible={isDateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onConfirm={handleForkConfirm}
      />
    </View>
  );
}
