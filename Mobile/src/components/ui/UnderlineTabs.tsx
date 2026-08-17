import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

export interface UnderlineTabItem {
  key: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface UnderlineTabsProps {
  items: UnderlineTabItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function UnderlineTabs({
  items,
  selectedKey,
  onSelect,
  scrollable = true,
  style,
}: UnderlineTabsProps) {
  const tabs = items.map(item => {
    const isActive = item.key === selectedKey;
    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.tab,
          !scrollable && styles.tabFlexible,
          isActive && styles.tabActive,
        ]}
        onPress={() => onSelect(item.key)}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        {item.icon ? <View style={styles.icon}>{item.icon}</View> : null}
        <Text
          style={[styles.label, isActive && styles.labelActive]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {item.count !== undefined ? (
          <Text style={[styles.count, isActive && styles.labelActive]}>
            {item.count}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  });

  if (!scrollable) {
    return (
      <View style={[styles.container, style]} accessibilityRole="tablist">
        {tabs}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.scrollContent}
      accessibilityRole="tablist"
    >
      {tabs}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  scrollContent: {
    paddingHorizontal: normalize(8),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(13),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabFlexible: {
    flex: 1,
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomColor: tokens.colors.primary,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  labelActive: {
    color: tokens.colors.primary,
  },
  count: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textTertiary,
  },
});
