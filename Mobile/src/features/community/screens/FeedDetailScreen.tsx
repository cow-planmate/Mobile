import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CalendarDays,
  ChevronLeft,
  Copy,
  Eye,
  MapPin,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react-native';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { CalendarModal } from '../../../components/common';
import { FeedStackParamList } from '../../../navigation/types';
import { usePost, useReactToPost, useForkItinerary } from '../hooks/queries';
import { formatDuration } from '../services/communityApi';
import { canForkItinerary } from '../utils/itineraryToPlan';
import { resolveAvatarUrl } from '../utils/avatar';
import PostContentView from '../components/PostContentView';
import CommentSection from '../components/CommentSection';
import UserAvatar from '../components/UserAvatar';
import PublicProfileModal from '../components/PublicProfileModal';
import LevelBadge from '../components/LevelBadge';
import { ReactionType } from '../types';
import { styles, COLORS } from './FeedDetailScreen.styles';

type FeedDetailRoute = RouteProp<FeedStackParamList, 'FeedDetail'>;

/** 여행기 상세 — 일정 스냅샷을 보여주고 "가져가기"로 내 일정에 복제한다 */
export default function FeedDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<FeedDetailRoute>();
  const { showAlert } = useAlert();

  const postId = route.params?.postId;
  const user = useAuthStore(state => state.user);
  const isLoggedIn = !!user;

  const [isAuthorProfileVisible, setAuthorProfileVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isDateModalVisible, setDateModalVisible] = useState(false);

  const { data: post, isLoading, isError } = usePost(postId);
  const react = useReactToPost(postId ?? '');
  const fork = useForkItinerary(postId ?? '');

  const days = useMemo(() => post?.itinerary?.days ?? [], [post]);
  const isForkable = canForkItinerary(post?.itinerary);
  const heroImage = post?.image;

  const handleReact = async (type: ReactionType) => {
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
  };

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

  /**
   * 고른 시작일 기준으로 일정을 복제한다.
   * 스냅샷의 원래 날짜는 버리고 1일차부터 시작일에 맞춰 밀어 넣는다.
   */
  const handleForkConfirm = async ({ startDate }: { startDate: Date }) => {
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
            ? `내 일정에 담았어요. 시간이 겹치는 블록 ${adjustedBlocks}개는 뒤로 밀어 정리했습니다.`
            : '내 일정에 담았어요.',
        type: 'success',
        buttons: [
          { text: '닫기', style: 'cancel' },
          {
            text: '일정 보기',
            onPress: () =>
              navigation.navigate('ItineraryEditor', { planId: String(planId) }),
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
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.topBarButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <ChevronLeft size={normalize(22)} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.topBarTitle}>여행기</Text>
      <View style={styles.topBarButton} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {renderTopBar()}
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            여행기를 찾을 수 없어요.{'\n'}삭제되었거나 접근할 수 없는 글입니다.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.stateLink}>목록으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentDay = days[selectedDay];
  const durationLabel = formatDuration(post.durationDays);
  const regionLabel = post.location ?? post.region;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderTopBar()}

      <ScrollView showsVerticalScrollIndicator={false}>
        {!!heroImage && (
          <FastImage
            style={styles.hero}
            source={{ uri: heroImage }}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.chipRow}>
            {!!regionLabel && (
              <View style={styles.chip}>
                <MapPin size={normalize(11)} color={COLORS.textSecondary} />
                <Text style={styles.chipText}>{regionLabel}</Text>
              </View>
            )}
            {!!durationLabel && (
              <View style={styles.chip}>
                <CalendarDays
                  size={normalize(11)}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.chipText}>{durationLabel}</Text>
              </View>
            )}
            {(post.tags ?? []).map(tag => (
              <View key={tag} style={[styles.chip, styles.tagChip]}>
                <Text style={[styles.chipText, styles.tagChipText]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.metaRow}>
            {/* 작성자를 누르면 공개 프로필을 보여준다 */}
            <TouchableOpacity
              style={styles.authorTouchable}
              onPress={() => setAuthorProfileVisible(true)}
              activeOpacity={0.7}
              hitSlop={6}
            >
              <UserAvatar
                name={post.author}
                imageUrl={resolveAvatarUrl(post.authorImage, post.authorAvatarHash)}
                size={normalize(24)}
              />
              <Text style={styles.metaAuthor}>{post.author}</Text>
            </TouchableOpacity>
            <LevelBadge level={post.level} />
            <Text style={styles.metaText}>· {post.createdAt}</Text>
            <View style={styles.metaStat}>
              <Eye size={normalize(12)} color={COLORS.textTertiary} />
              <Text style={styles.metaText}>{post.views}</Text>
            </View>
            <View style={styles.metaStat}>
              <Copy size={normalize(11)} color={COLORS.textTertiary} />
              <Text style={styles.metaText}>{post.forks ?? 0}</Text>
            </View>
          </View>
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
          >
            <Copy size={normalize(15)} color={COLORS.white} />
            <Text style={styles.forkButtonText}>
              {fork.isPending ? '가져오는 중…' : '내 일정으로 가져가기'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.forkHint}>
            {isForkable
              ? '시작일만 고르면 이 일정 그대로 내 일정에 담깁니다.'
              : '이 여행기에는 가져갈 수 있는 일정 정보가 없어요.'}
          </Text>
        </View>

        {days.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <CalendarDays size={normalize(15)} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>일정 ({days.length}일)</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayTabs}
            >
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

            {(currentDay?.items ?? []).length === 0 ? (
              <Text style={styles.emptyDay}>이 날에는 등록된 장소가 없어요</Text>
            ) : (
              (currentDay?.items ?? []).map((item, index) => (
                <View key={`${item.place}-${index}`} style={styles.place}>
                  <Text style={styles.placeTime}>{item.time}</Text>
                  <View style={styles.placeBody}>
                    <Text style={styles.placeName}>{item.place}</Text>
                    {!!(item.placeAddress ?? item.description) && (
                      <Text style={styles.placeSub}>
                        {item.placeAddress ?? item.description}
                      </Text>
                    )}
                    {!!item.memo && (
                      <Text style={styles.placeMemo}>{item.memo}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.body}>
          <PostContentView
            content={post.content}
            contentText={post.contentText}
          />
        </View>

        <View style={styles.reactionRow}>
          <TouchableOpacity
            style={[
              styles.reactionButton,
              post.myReaction === 'like' && styles.reactionButtonActive,
            ]}
            onPress={() => handleReact('like')}
            activeOpacity={0.85}
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
              좋아요 {post.likes}
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

        <CommentSection postId={post.id} commentCount={post.comments} />

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
