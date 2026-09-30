import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge } from '../../../components/ui';
import { normalize } from '../../../utils/normalize';
import { CommunityPostSummary } from '../types';

interface PostTypeBadgesProps {
  post: CommunityPostSummary;
  category: string;
}

export default function PostTypeBadges({
  post,
  category,
}: PostTypeBadgesProps) {
  const badges: React.ReactNode[] = [];

  if (category === 'qna') {
    badges.push(
      <Badge
        key="answered"
        label={post.isAnswered ? '답변완료' : '답변대기'}
        tone={post.isAnswered ? 'success' : 'neutral'}
      />,
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return <View style={styles.row}>{badges}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: normalize(4),
    marginBottom: normalize(6),
  },
});
