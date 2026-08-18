import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CalendarDays from 'lucide-react-native/dist/esm/icons/calendar-days';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import FileText from 'lucide-react-native/dist/esm/icons/file-text';
import Heart from 'lucide-react-native/dist/esm/icons/heart';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle';
import {
  Card,
  EmptyState,
  SectionHeader,
  UnderlineTabs,
} from '../../../components/ui';
import { ProfilePlan } from '../../../hooks/useUserProfile';
import {
  useLikedPosts,
  useMyComments,
  useMyPosts,
} from '../../community/hooks/queries';
import { CommunityPostSummary } from '../../community/types';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import {
  getCalendarCells,
  isDateInPlanPeriod,
} from '../utils/profileCalendar';

type ActivityTab = 'posts' | 'likes' | 'comments';

const MONTH_LABELS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const CATEGORY_LABEL: Record<string, string> = {
  free: '자유',
  qna: 'Q&A',
  mate: '메이트',
  recommend: '추천',
  feed: '여행기',
};

const ACTIVITY_TABS = [
  { key: 'posts', label: '작성글' },
  { key: 'likes', label: '좋아요' },
  { key: 'comments', label: '댓글' },
];

const isDateInPlan = (date: Date, plan: ProfilePlan) =>
  isDateInPlanPeriod(date, plan.startDate, plan.endDate);

const PostRow = ({ post }: { post: CommunityPostSummary }) => (
  <View style={styles.activityRow}>
    <View style={styles.rowMeta}>
      <Text style={styles.category}>
        {CATEGORY_LABEL[post.category] ?? '커뮤니티'}
      </Text>
      <Text style={styles.date}>{post.createdAt}</Text>
    </View>
    <Text style={styles.rowTitle} numberOfLines={1}>
      {post.title}
    </Text>
    <View style={styles.counts}>
      <Heart size={12} color={tokens.colors.textSecondary} />
      <Text style={styles.countText}>{post.likes}</Text>
      <MessageCircle size={12} color={tokens.colors.textSecondary} />
      <Text style={styles.countText}>{post.comments}</Text>
    </View>
  </View>
);

export function ProfileCalendarSection({ plans }: { plans: ProfilePlan[] }) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const calendarCells = useMemo(() => getCalendarCells(month), [month]);

  const selectedPlans = useMemo(
    () =>
      selectedDate
        ? plans.filter(plan => isDateInPlan(selectedDate, plan))
        : [],
    [selectedDate, plans],
  );

  const shiftMonth = (delta: number) => {
    setSelectedDate(null);
    setMonth(current =>
      new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  };

  return (
    <Card style={styles.card} variant="flat">
      <SectionHeader
        title="여행 캘린더"
        icon={<CalendarDays size={18} color={tokens.colors.primary} />}
      />

      <View style={styles.monthNav}>
        <Pressable
          style={styles.monthButton}
          onPress={() => shiftMonth(-1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="이전 달"
        >
          <ChevronLeft size={18} color={tokens.colors.textSecondary} />
        </Pressable>
        <Text style={styles.monthTitle}>
          {month.getFullYear()}년 {MONTH_LABELS[month.getMonth()]}
        </Text>
        <Pressable
          style={styles.monthButton}
          onPress={() => shiftMonth(1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="다음 달"
        >
          <ChevronRight size={18} color={tokens.colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <Text
            key={day}
            style={[styles.weekLabel, index === 0 && styles.weekLabelSunday]}
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarCells.map(date => {
          const relatedPlans = plans.filter(plan => isDateInPlan(date, plan));
          const isCurrentMonth = date.getMonth() === month.getMonth();
          const isSelected =
            selectedDate !== null &&
            date.toDateString() === selectedDate.toDateString();

          return (
            <Pressable
              key={date.toISOString()}
              style={styles.dayCellPressable}
              onPress={() => setSelectedDate(isSelected ? null : date)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${date.getMonth() + 1}월 ${date.getDate()}일${
                relatedPlans.length > 0 ? `, 일정 ${relatedPlans.length}건` : ''
              }`}
            >
              <View style={styles.dayCell}>
                <View
                  style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.dayTextMuted,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.planBar,
                    relatedPlans.length === 0 && styles.planBarHidden,
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedDate ? (
        <View style={styles.selectedDayBox}>
          <Text style={styles.selectedDayTitle}>
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
          </Text>
          {selectedPlans.length === 0 ? (
            <Text style={styles.legendText}>이 날에는 여행 일정이 없어요.</Text>
          ) : (
            selectedPlans.map(plan => (
              <View key={plan.planId} style={styles.selectedPlanRow}>
                <View style={styles.planDot} />
                <Text style={styles.selectedPlanName} numberOfLines={1}>
                  {plan.planName}
                </Text>
              </View>
            ))
          )}
        </View>
      ) : plans.length > 0 ? (
        <View style={styles.planLegend}>
          <View style={styles.planBar} />
          <Text style={styles.legendText}>
            여행이 있는 날. 날짜를 누르면 일정을 볼 수 있어요.
          </Text>
        </View>
      ) : (
        <EmptyState
          title="등록한 여행 일정이 없어요"
          style={styles.innerEmpty}
        />
      )}
    </Card>
  );
}

export function ProfileFootprintSection({ plans }: { plans: ProfilePlan[] }) {
  return (
    <Card style={styles.card} variant="flat">
      <SectionHeader
        title="여행 발자취"
        count={plans.length > 0 ? plans.length : undefined}
        icon={<MapPin size={18} color={tokens.colors.primary} />}
      />
      {plans.length === 0 ? (
        <EmptyState
          title="아직 발자취가 없어요"
          description="완료한 여행을 추가하면 발자취가 쌓입니다."
          style={styles.innerEmpty}
        />
      ) : (
        <View style={styles.footprintList}>
          {plans.slice(0, 6).map(plan => (
            <View key={plan.planId} style={styles.footprintRow}>
              <View style={styles.footprintMarker} />
              <View style={styles.footprintText}>
                <Text style={styles.footprintName} numberOfLines={1}>
                  {plan.planName}
                </Text>
                <Text style={styles.footprintDate}>
                  {plan.startDate ?? '일정 날짜 확인 필요'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

export function ProfileTravelLogSection() {
  const { data, isLoading, isError } = useMyPosts('feed', 6);
  const travelLogs = data?.items ?? [];

  return (
    <Card style={styles.card} variant="flat">
      <SectionHeader
        title="나의 여행기"
        icon={<FileText size={18} color={tokens.colors.primary} />}
      />
      {isLoading ? (
        <ActivityIndicator color={tokens.colors.primary} />
      ) : isError ? (
        <EmptyState
          title="여행기를 불러오지 못했어요"
          style={styles.innerEmpty}
        />
      ) : travelLogs.length === 0 ? (
        <EmptyState
          title="작성한 여행기가 없어요"
          description="다녀온 여행을 여행기로 남겨보세요."
          style={styles.innerEmpty}
        />
      ) : (
        travelLogs.map(post => <PostRow key={post.id} post={post} />)
      )}
    </Card>
  );
}

export function ProfileCommunitySection() {
  const [activityTab, setActivityTab] = useState<ActivityTab>('posts');
  const {
    data: postData,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useMyPosts(undefined, 8);
  const {
    data: likedData,
    isLoading: isLikedLoading,
    isError: isLikedError,
  } = useLikedPosts(undefined, 8);
  const {
    data: commentData,
    isLoading: isCommentLoading,
    isError: isCommentError,
  } = useMyComments(8);

  const communityPosts = useMemo(
    () => (postData?.items ?? []).filter(post => post.category !== 'feed'),
    [postData?.items],
  );
  const communityLikes = useMemo(
    () => (likedData?.items ?? []).filter(post => post.category !== 'feed'),
    [likedData?.items],
  );

  const activeItems = activityTab === 'posts' ? communityPosts : communityLikes;
  const isActivityLoading =
    activityTab === 'posts' ? isPostLoading : isLikedLoading;
  const isActivityError = activityTab === 'posts' ? isPostError : isLikedError;

  const renderBody = () => {
    if (activityTab === 'comments') {
      if (isCommentLoading) {
        return <ActivityIndicator color={tokens.colors.primary} />;
      }
      if (isCommentError) {
        return (
          <EmptyState
            title="댓글 활동을 불러오지 못했어요"
            style={styles.innerEmpty}
          />
        );
      }
      const comments = commentData?.items ?? [];
      if (comments.length === 0) {
        return (
          <EmptyState title="작성한 댓글이 없어요" style={styles.innerEmpty} />
        );
      }
      return comments.map(comment => (
        <View key={comment.id} style={styles.activityRow}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {comment.postTitle ?? '게시글'}
          </Text>
          <Text style={styles.commentText} numberOfLines={2}>
            {comment.content}
          </Text>
          <Text style={styles.date}>{comment.createdAt}</Text>
        </View>
      ));
    }

    if (isActivityLoading) {
      return <ActivityIndicator color={tokens.colors.primary} />;
    }
    if (isActivityError) {
      return (
        <EmptyState
          title="커뮤니티 활동을 불러오지 못했어요"
          style={styles.innerEmpty}
        />
      );
    }
    if (activeItems.length === 0) {
      return (
        <EmptyState
          title={
            activityTab === 'posts'
              ? '작성한 커뮤니티 글이 없어요'
              : '좋아요한 글이 없어요'
          }
          style={styles.innerEmpty}
        />
      );
    }
    return activeItems.map(post => <PostRow key={post.id} post={post} />);
  };

  return (
    <Card style={styles.card} variant="flat" padding="none">
      <View style={styles.cardInnerHeader}>
        <SectionHeader
          title="커뮤니티 활동"
          icon={<MessageCircle size={18} color={tokens.colors.primary} />}
        />
      </View>
      <UnderlineTabs
        items={ACTIVITY_TABS}
        selectedKey={activityTab}
        onSelect={key => setActivityTab(key as ActivityTab)}
        scrollable={false}
      />
      <View style={styles.cardInnerBody}>{renderBody()}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: normalize(12),
  },
  cardInnerHeader: {
    padding: normalize(16),
    paddingBottom: normalize(12),
  },
  cardInnerBody: {
    padding: normalize(16),
    paddingTop: normalize(4),
  },
  innerEmpty: {
    borderWidth: 0,
    paddingVertical: normalize(24),
  },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(14),
    marginBottom: normalize(12),
  },
  monthButton: {
    padding: normalize(4),
  },
  monthTitle: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: normalize(6),
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textTertiary,
  },
  weekLabelSunday: {
    color: tokens.tones.danger.fg,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellPressable: {
    width: '14.2857%',
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: normalize(3),
  },
  dayNumber: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: tokens.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberSelected: {
    backgroundColor: tokens.colors.primary,
  },
  dayText: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.text,
  },
  dayTextMuted: {
    color: tokens.colors.textTertiary,
  },
  dayTextSelected: {
    color: tokens.colors.white,
  },
  planBar: {
    width: normalize(16),
    height: normalize(3),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primary,
    marginTop: normalize(3),
  },
  planBarHidden: {
    backgroundColor: 'transparent',
  },
  planDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primary,
  },
  planLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginTop: normalize(12),
  },
  legendText: {
    flex: 1,
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  selectedDayBox: {
    marginTop: normalize(12),
    padding: normalize(12),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.surface,
    gap: normalize(6),
  },
  selectedDayTitle: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  selectedPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  selectedPlanName: {
    flex: 1,
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },

  footprintList: {
    gap: normalize(12),
    marginTop: normalize(14),
  },
  footprintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  footprintMarker: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primaryTint,
    borderWidth: 3,
    borderColor: tokens.colors.primary,
  },
  footprintText: {
    flex: 1,
  },
  footprintName: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  footprintDate: {
    marginTop: normalize(2),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },

  activityRow: {
    gap: normalize(4),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  category: {
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  date: {
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  rowTitle: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },
  countText: {
    marginRight: normalize(6),
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  commentText: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
});
