import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../screens/ItineraryEditorScreen.styles';

/** 도구줄의 아이콘 버튼. 테두리와 바탕 없이 아이콘만 보인다. */
const ToolbarIconButton = ({
  label,
  children,
  onPress,
  disabled = false,
  badgeCount,
  targetRef,
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  badgeCount?: number;
  /** 첫 진입 안내가 이 버튼을 짚을 수 있게 다는 ref. */
  targetRef?: (node: unknown) => void;
}) => (
  <TouchableOpacity
    ref={targetRef}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.6}
    hitSlop={4}
    style={[
      styles.toolbarIconButton,
      disabled && styles.toolbarIconButtonDisabled,
    ]}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
  >
    {children}
    {typeof badgeCount === 'number' && badgeCount > 0 && (
      <View style={styles.toolbarBadge}>
        <Text style={styles.toolbarBadgeText}>
          {badgeCount > 9 ? '9+' : badgeCount}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

export default ToolbarIconButton;
