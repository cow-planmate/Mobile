import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import Star from 'lucide-react-native/dist/esm/icons/star';
import { Badge } from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { CommunityPostSummary } from '../types';

interface PostTypeBadgesProps {
  post: CommunityPostSummary;
  category: string;
}

export default function PostTypeBadges({ post, category }: PostTypeBadgesProps) {
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

  if (category === 'recommend') {
    if (post.location) {
      badges.push(
        <Badge
          key="location"
          label={post.location}
          tone="place"
          icon={<MapPin size={9} color={tokens.tones.place.fg} />}
          style={styles.location}
        />,
      );
    }
    if (post.rating) {
      badges.push(
        <Badge
          key="rating"
          label={String(post.rating)}
          tone="rating"
          icon={<Star size={9} color={tokens.tones.rating.fg} />}
        />,
      );
    }
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
  location: {
    maxWidth: '60%',
  },
});
