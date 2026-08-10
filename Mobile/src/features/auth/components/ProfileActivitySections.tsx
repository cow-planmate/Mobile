import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
} from 'lucide-react-native';
import { ProfilePlan } from '../../../hooks/useUserProfile';
import {
  useLikedPosts,
  useMyComments,
  useMyPosts,
} from '../../community/hooks/queries';
import { CommunityPostSummary } from '../../community/types';
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

const isDateInPlan = (date: Date, plan: ProfilePlan) => {
  return isDateInPlanPeriod(date, plan.startDate, plan.endDate);
};

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <View style={styles.sectionHeader}>
    {icon}
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{children}</Text>
  </View>
);

const PostRow = ({ post }: { post: CommunityPostSummary }) => (
  <View style={styles.activityRow}>
    <View style={styles.activityBody}>
      <View style={styles.rowMeta}>
        <Text style={styles.category}>{CATEGORY_LABEL[post.category] ?? '커뮤니티'}</Text>
        <Text style={styles.date}>{post.createdAt}</Text>
      </View>
      <Text style={styles.rowTitle} numberOfLines={1}>{post.title}</Text>
      <View style={styles.counts}>
        <Heart size={12} color="#6B7280" />
        <Text style={styles.countText}>{post.likes}</Text>
        <MessageCircle size={12} color="#6B7280" />
        <Text style={styles.countText}>{post.comments}</Text>
      </View>
    </View>
  </View>
);

interface ProfileActivitySectionsProps {
  plans: ProfilePlan[];
}

export default function ProfileActivitySections({ plans }: ProfileActivitySectionsProps) {
  const [month, setMonth] = useState(() => new Date());
  const [activityTab, setActivityTab] = useState<ActivityTab>('posts');
  const { data: feedData, isLoading: isFeedLoading, isError: isFeedError } = useMyPosts('feed', 6);
  const { data: postData, isLoading: isPostLoading, isError: isPostError } = useMyPosts(undefined, 8);
  const { data: likedData, isLoading: isLikedLoading, isError: isLikedError } = useLikedPosts(undefined, 8);
  const { data: commentData, isLoading: isCommentLoading, isError: isCommentError } = useMyComments(8);

  const travelLogs = feedData?.items ?? [];
  const communityPosts = useMemo(
    () => (postData?.items ?? []).filter(post => post.category !== 'feed'),
    [postData?.items],
  );
  const communityLikes = useMemo(
    () => (likedData?.items ?? []).filter(post => post.category !== 'feed'),
    [likedData?.items],
  );
  const calendarCells = useMemo(() => getCalendarCells(month), [month]);
  const activeItems = activityTab === 'posts' ? communityPosts : communityLikes;
  const isActivityLoading = activityTab === 'posts' ? isPostLoading : isLikedLoading;

  return (
    <View style={styles.container}>
      <View style={styles.calendarCard}>
        <SectionHeader icon={<CalendarDays size={18} color="#1344FF" />} title="여행 캘린더" />
        <View style={styles.monthNav}>
          <Pressable
            style={styles.monthButton}
            onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
          >
            <ChevronLeft size={18} color="#4B5563" />
          </Pressable>
          <Text style={styles.monthTitle}>{month.getFullYear()}년 {MONTH_LABELS[month.getMonth()]}</Text>
          <Pressable
            style={styles.monthButton}
            onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          >
            <ChevronRight size={18} color="#4B5563" />
          </Pressable>
        </View>
        <View style={styles.weekRow}>
          {['일', '월', '화', '수', '목', '금', '토'].map(day => <Text key={day} style={styles.weekLabel}>{day}</Text>)}
        </View>
        <View style={styles.calendarGrid}>
          {calendarCells.map(date => {
            const relatedPlans = plans.filter(plan => isDateInPlan(date, plan));
            const isCurrentMonth = date.getMonth() === month.getMonth();
            return (
              <View key={date.toISOString()} style={styles.dayCell}>
                <Text style={[styles.dayText, !isCurrentMonth && styles.dayTextMuted]}>{date.getDate()}</Text>
                {relatedPlans.slice(0, 1).map(plan => <View key={plan.planId} style={styles.planDot} />)}
              </View>
            );
          })}
        </View>
        {plans.length > 0 ? (
          <View style={styles.planLegend}>
            <View style={styles.planDot} />
            <Text style={styles.legendText}>등록한 여행 일정</Text>
          </View>
        ) : <EmptyState>등록한 여행 일정이 없습니다.</EmptyState>}
      </View>

      <View style={styles.footprintCard}>
        <SectionHeader icon={<MapPin size={18} color="#1344FF" />} title="여행 발자취" />
        {plans.length === 0 ? <EmptyState>완료한 여행을 추가하면 발자취가 쌓입니다.</EmptyState> : (
          <View style={styles.footprintList}>
            {plans.slice(0, 4).map(plan => (
              <View key={plan.planId} style={styles.footprintRow}>
                <View style={styles.footprintMarker} />
                <View style={styles.footprintText}>
                  <Text style={styles.footprintName} numberOfLines={1}>{plan.planName}</Text>
                  <Text style={styles.footprintDate}>{plan.startDate ?? '일정 날짜 확인 필요'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <SectionHeader icon={<FileText size={18} color="#1344FF" />} title="여행 기록" />
        {isFeedLoading ? <ActivityIndicator color="#1344FF" /> : isFeedError ? (
          <EmptyState>여행 기록을 불러오지 못했습니다.</EmptyState>
        ) : travelLogs.length === 0 ? (
          <EmptyState>작성한 여행기가 없습니다.</EmptyState>
        ) : travelLogs.map(post => <PostRow key={post.id} post={post} />)}
      </View>

      <View style={styles.card}>
        <SectionHeader icon={<MessageCircle size={18} color="#1344FF" />} title="커뮤니티 활동" />
        <View style={styles.tabs}>
          {([['posts', '작성글'], ['likes', '좋아요'], ['comments', '댓글']] as const).map(([key, label]) => (
            <Pressable key={key} style={[styles.tab, activityTab === key && styles.tabSelected]} onPress={() => setActivityTab(key)}>
              <Text style={[styles.tabText, activityTab === key && styles.tabTextSelected]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {activityTab === 'comments' ? (
          isCommentLoading ? <ActivityIndicator color="#1344FF" /> : isCommentError ? (
            <EmptyState>댓글 활동을 불러오지 못했습니다.</EmptyState>
          ) : (commentData?.items ?? []).length === 0 ? (
            <EmptyState>작성한 댓글이 없습니다.</EmptyState>
          ) : commentData!.items.map(comment => (
            <View key={comment.id} style={styles.activityRow}>
              <View style={styles.activityBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>{comment.postTitle ?? '게시글'}</Text>
                <Text style={styles.commentText} numberOfLines={2}>{comment.content}</Text>
                <Text style={styles.date}>{comment.createdAt}</Text>
              </View>
            </View>
          ))
        ) : isActivityLoading ? <ActivityIndicator color="#1344FF" /> : (activityTab === 'posts' ? isPostError : isLikedError) ? (
          <EmptyState>커뮤니티 활동을 불러오지 못했습니다.</EmptyState>
        ) : activeItems.length === 0 ? (
          <EmptyState>{activityTab === 'posts' ? '작성한 커뮤니티 글이 없습니다.' : '좋아요한 커뮤니티 글이 없습니다.'}</EmptyState>
        ) : activeItems.map(post => <PostRow key={post.id} post={post} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginTop: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 12 },
  calendarCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  footprintCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { color: '#111827', fontSize: 16, fontWeight: '700' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthButton: { padding: 4 },
  monthTitle: { color: '#111827', fontSize: 15, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: { flex: 1, color: '#9CA3AF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', minHeight: 34, alignItems: 'center', paddingTop: 2 },
  dayText: { color: '#374151', fontSize: 12 },
  dayTextMuted: { color: '#D1D5DB' },
  planDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#1344FF', marginTop: 3 },
  planLegend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  legendText: { color: '#6B7280', fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 12 },
  emptyText: { color: '#9CA3AF', fontSize: 13, textAlign: 'center' },
  footprintList: { gap: 12 },
  footprintRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footprintMarker: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DBEAFE', borderWidth: 3, borderColor: '#1344FF' },
  footprintText: { flex: 1 },
  footprintName: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  footprintDate: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9 },
  tabSelected: { borderBottomWidth: 2, borderBottomColor: '#1344FF' },
  tabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  tabTextSelected: { color: '#1344FF' },
  activityRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  activityBody: { flex: 1, gap: 4 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  category: { color: '#1344FF', fontSize: 11, fontWeight: '700' },
  date: { color: '#9CA3AF', fontSize: 11 },
  rowTitle: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  counts: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  countText: { color: '#6B7280', fontSize: 11, marginRight: 6 },
  commentText: { color: '#6B7280', fontSize: 13 },
});
