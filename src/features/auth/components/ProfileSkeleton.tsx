import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bone, Skeleton } from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

const TASTE_ROWS = 3;

/**
 * 마이페이지 프로필 탭의 뼈대. 실제 화면(프로필 머리, 취향 카드)과 같은 자리·크기로 짠다.
 */
export default function ProfileSkeleton() {
  return (
    <Skeleton label="프로필을 불러오는 중" style={styles.container}>
      <View style={styles.head}>
        <View style={styles.headRow}>
          <Bone width={56} height={56} radius={28} />
          <View style={styles.nameBlock}>
            <Bone width={96} height={18} />
            <Bone width={150} height={12} />
          </View>
        </View>
        <Bone width="100%" height={40} radius={10} />
      </View>

      <View style={styles.band} />

      <View style={styles.tasteHeader}>
        <View style={styles.tasteHeaderText}>
          <Bone width={132} height={16} />
          <Bone width={72} height={11} />
        </View>
        <Bone width={44} height={26} radius={8} />
      </View>

      <View style={styles.tasteRows}>
        {Array.from({ length: TASTE_ROWS }, (_, index) => (
          <View
            key={index}
            style={[
              styles.tasteRow,
              index === TASTE_ROWS - 1 && styles.tasteRowLast,
            ]}
          >
            <View style={styles.tasteRowLeft}>
              <Bone width={34} height={34} radius={10} />
              <View style={styles.tasteRowText}>
                <Bone width={52} height={13} />
                <Bone width={70} height={10} />
              </View>
            </View>
            <Bone width={56} height={22} radius={6} />
          </View>
        ))}
      </View>
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  head: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(18),
    paddingBottom: normalize(15),
    gap: normalize(14),
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  nameBlock: {
    gap: normalize(8),
  },
  band: {
    height: normalize(20),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.pageGround,
  },
  tasteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(17),
  },
  tasteHeaderText: {
    gap: normalize(6),
  },
  tasteRows: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(6),
  },
  tasteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(11),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  tasteRowLast: {
    borderBottomWidth: 0,
  },
  tasteRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  tasteRowText: {
    gap: normalize(4),
  },
});
