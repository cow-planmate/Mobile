import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Landmark from 'lucide-react-native/dist/esm/icons/landmark';
import BedDouble from 'lucide-react-native/dist/esm/icons/bed-double';
import Utensils from 'lucide-react-native/dist/esm/icons/utensils';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import {
  TasteGroup,
  countPreferredThemes,
} from '../utils/profileTaste';

/**
 * 웹 마이페이지의 '내가 좋아하는 여행' 카드를 폰 폭에 맞춰 세운 것.
 *
 * 갈래마다 아이콘 한 개와 알약 목록을 두고, 고른 것이 없는 갈래도 자리를
 * 지킨다. 편집은 테마를 고르는 창을 연다 — 예전에는 편집 시트 안 목록을
 * 훑어야 닿던 자리다.
 */
const ICONS = {
  장소: { Icon: Landmark, bg: tokens.colors.primaryTint, fg: tokens.colors.primary },
  숙소: { Icon: BedDouble, bg: '#F3EEFF', fg: '#7B52C9' },
  식당: { Icon: Utensils, bg: '#FFF1E8', fg: '#D1703A' },
} as const;

export default function ProfileTasteCard({
  groups,
  onEdit,
}: {
  groups: TasteGroup[];
  onEdit: () => void;
}) {
  const total = countPreferredThemes(groups);

  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>내가 좋아하는 여행</Text>
          <Text style={styles.subtitle}>{`선택한 취향 ${total}개`}</Text>
        </View>
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.7}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="여행 취향 편집"
        >
          <Text style={styles.edit}>편집</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rows}>
        {groups.map(group => {
          const icon = ICONS[group.label as keyof typeof ICONS] ?? ICONS.장소;
          const { Icon } = icon;
          return (
            <View key={group.label} style={styles.row}>
              <View style={[styles.icon, { backgroundColor: icon.bg }]}>
                <Icon size={normalize(17)} color={icon.fg} strokeWidth={1.9} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>
                  {group.label}
                  <Text style={styles.rowHint}>{`  ${group.hint}`}</Text>
                </Text>
                {group.names.length > 0 ? (
                  <View style={styles.pills}>
                    {group.names.map(name => (
                      <View key={name} style={styles.pill}>
                        <Text style={styles.pillText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.rowEmpty}>아직 선택한 취향이 없어요</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: tokens.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: normalize(12),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(17),
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: normalize(16.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
    marginTop: normalize(2),
  },
  edit: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  rows: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(12),
    paddingVertical: normalize(13),
  },
  icon: {
    width: normalize(34),
    height: normalize(34),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  rowHint: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
    marginTop: normalize(7),
  },
  pill: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(3),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  pillText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
  },
  rowEmpty: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
    marginTop: normalize(6),
  },
});
