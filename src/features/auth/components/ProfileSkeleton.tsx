import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bone, Skeleton } from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

/** 구역 이름 한 줄(내 취향·계정·도움). */
function LabelBone({ width }: { width: number }) {
  return (
    <View style={styles.label}>
      <View style={styles.labelLine}>
        <Bone width={width} height={12} />
      </View>
    </View>
  );
}

/** 행 한 줄. 왼쪽 이름, 값이 있으면 오른쪽에 값. */
function RowBone({
  labelWidth,
  valueWidth,
}: {
  labelWidth: number;
  valueWidth?: number;
}) {
  return (
    <View style={styles.row}>
      <Bone width={labelWidth} height={16} />
      {valueWidth ? <Bone width={valueWidth} height={14} /> : null}
    </View>
  );
}

/**
 * 마이페이지 프로필 탭의 뼈대. 실제 화면(사진 줄, 내 취향·계정·도움 행 목록)과
 * 같은 자리·크기로 짠다.
 */
export default function ProfileSkeleton() {
  return (
    <Skeleton label="프로필을 불러오는 중" style={styles.container}>
      <View style={styles.head}>
        <Bone width={48} height={48} radius={24} />
        <View style={styles.nameBlock}>
          <Bone width={96} height={18} />
          <Bone width={150} height={12} />
        </View>
        <Bone width={24} height={14} />
      </View>

      <View style={styles.band} />

      <LabelBone width={36} />
      <RowBone labelWidth={44} valueWidth={56} />
      <RowBone labelWidth={32} valueWidth={44} />
      <RowBone labelWidth={32} valueWidth={64} />

      <View style={styles.band} />

      <LabelBone width={24} />
      <RowBone labelWidth={84} />
      <RowBone labelWidth={52} />

      <View style={styles.band} />

      <LabelBone width={24} />
      <RowBone labelWidth={72} />
      <RowBone labelWidth={104} />
      <RowBone labelWidth={56} valueWidth={36} />
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  // 실제 화면의 사진·이름 줄(ProfileScreen.styles의 editButton)과 같은 여백.
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(tokens.spacing.m),
    padding: normalize(tokens.spacing.m),
  },
  nameBlock: {
    flex: 1,
    gap: normalize(6),
  },
  band: {
    height: normalize(20),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.pageGround,
  },
  // 실제 화면의 ProfileMenuLabel·ProfileMenuRow와 같은 여백과 높이.
  label: {
    paddingHorizontal: normalize(tokens.spacing.m),
    paddingTop: normalize(tokens.spacing.m),
    paddingBottom: normalize(tokens.spacing.xs),
  },
  // 12px 글자 한 줄의 높이. 뼈대 막대(12)만 두면 아래 행이 위로 뜬다.
  labelLine: {
    height: normalize(17),
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: normalize(52),
    paddingHorizontal: normalize(tokens.spacing.m),
  },
});
