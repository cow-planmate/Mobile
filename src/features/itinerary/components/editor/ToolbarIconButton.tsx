import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../screens/ItineraryEditorScreen.styles';

type ToolbarButtonVariant =
  | 'plain'
  | 'info'
  | 'outlineBlue'
  | 'outlineDark'
  | 'filledGray'
  | 'filledBlue';

const ToolbarIconButton = ({
  label,
  children,
  onPress,
  active = false,
  disabled = false,
  badgeCount,
  variant = 'info',
  targetRef,
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  badgeCount?: number;
  variant?: ToolbarButtonVariant;
  /** 첫 진입 안내가 이 버튼을 짚을 수 있게 다는 ref. */
  targetRef?: (node: unknown) => void;
}) => (
  <TouchableOpacity
    ref={targetRef}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    hitSlop={8}
    style={[
      styles.toolbarIconButton,
      variant === 'plain' && styles.toolbarIconButtonPlain,
      variant === 'info' && styles.toolbarIconButtonInfo,
      variant === 'outlineBlue' && styles.toolbarIconButtonOutlineBlue,
      variant === 'outlineDark' && styles.toolbarIconButtonOutlineDark,
      variant === 'filledGray' && styles.toolbarIconButtonFilledGray,
      variant === 'filledBlue' && styles.toolbarIconButtonFilledBlue,
      active && styles.toolbarIconButtonActive,
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
