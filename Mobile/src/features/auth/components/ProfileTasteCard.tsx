import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Landmark from 'lucide-react-native/dist/esm/icons/landmark';
import BedDouble from 'lucide-react-native/dist/esm/icons/bed-double';
import Utensils from 'lucide-react-native/dist/esm/icons/utensils';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { TasteGroup, countPreferredThemes } from '../utils/profileTaste';

/**
 * 웹 마이페이지의 '내가 좋아하는 여행' 카드를 폰 폭에 맞춰 세운 것.
 *
 * 갈래마다 아이콘 한 개와 알약 목록을 두고, 고른 것이 없는 갈래도 자리를
 * 지킨다. 편집은 테마를 고르는 창을 연다 — 예전에는 편집 시트 안 목록을
 * 훑어야 닿던 자리다.
 */
const ICONS = {
  관광지: {
    Icon: Landmark,
    bg: tokens.colors.primaryTint,
    fg: tokens.colors.primary,
  },
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
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.7}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="여행 취향 편집"
        >
          <Text style={styles.editText}>편집</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rows}>
        {groups.map((group, index) => {
          const icon = ICONS[group.label as keyof typeof ICONS] ?? ICONS.관광지;
          const { Icon } = icon;
          const isLast = index === groups.length - 1;
          return (
            <View
              key={group.label}
              style={[styles.row, isLast && styles.rowLast]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.icon, { backgroundColor: icon.bg }]}>
                  <Icon
                    size={normalize(17)}
                    color={icon.fg}
                    strokeWidth={1.9}
                  />
                </View>
                <View>
                  <Text style={styles.rowTitle}>{group.label}</Text>
                  {group.hint ? (
                    <Text style={styles.rowHint}>{group.hint}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.rowRight}>
                {group.names.length > 0 ? (
                  <View style={styles.pills}>
                    {group.names.map(name => (
                      <View key={name} style={styles.pill}>
                        <Text style={styles.pillText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addPillButton}
                    onPress={onEdit}
                    activeOpacity={0.7}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`${group.label} 취향 추가`}
                  >
                    <Plus
                      size={normalize(11)}
                      color={tokens.colors.primary}
                      strokeWidth={2.2}
                    />
                    <Text style={styles.addPillText}>취향 추가</Text>
                  </TouchableOpacity>
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
  editButton: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4.5),
    borderRadius: normalize(8),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: '#475569',
  },
  rows: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(6),
    paddingBottom: normalize(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(11),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    flexShrink: 0,
  },
  icon: {
    width: normalize(34),
    height: normalize(34),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  rowHint: {
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
    marginTop: normalize(1),
  },
  rowRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: normalize(12),
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: normalize(4),
  },
  pill: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
    backgroundColor: '#F1F5F9',
  },
  pillText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.medium,
    color: '#475569',
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addPillText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.primary,
  },
});
