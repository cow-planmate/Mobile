import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';
import { CheckCircle2, Info, XCircle } from 'lucide-react-native';
import { COLORS, RADIUS, TYPO } from '../../design/tokens';
import { sf, sp } from '../../design/scale';

const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: sf(16),
    paddingVertical: sf(12),
    borderRadius: RADIUS.md,
    marginHorizontal: sf(24),
    marginTop: sf(8),
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    color: COLORS.text,
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    textAlign: 'left',
    marginLeft: sf(8),
    flexShrink: 1,
    lineHeight: sp(TYPO.label.lineHeight),
  },
});

export const toastConfig: ToastConfig = {
  error: ({ text1 }) => (
    <View style={toastStyles.container}>
      <XCircle size={18} color={COLORS.error} strokeWidth={2.5} />
      <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    </View>
  ),
  success: ({ text1 }) => (
    <View style={toastStyles.container}>
      <CheckCircle2 size={18} color={COLORS.success} strokeWidth={2.5} />
      <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={toastStyles.container}>
      <Info size={18} color={COLORS.primary} strokeWidth={2.5} />
      <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    </View>
  ),
};
