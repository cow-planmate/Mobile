import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import Info from 'lucide-react-native/dist/esm/icons/info';
import XCircle from 'lucide-react-native/dist/esm/icons/circle-x';
import { sf, sp } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: sf(16),
    paddingVertical: sf(12),
    borderRadius: 14,
    marginHorizontal: sf(24),
    marginTop: sf(8),
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  textGroup: {
    marginLeft: sf(8),
    flexShrink: 1,
  },
  text: {
    color: tokens.colors.text,
    fontSize: sp(13),
    fontFamily: 'Pretendard-Medium',
    textAlign: 'left',
    flexShrink: 1,
    lineHeight: sp(18),
  },
  subText: {
    marginTop: sf(2),
    color: tokens.colors.textSecondary,
    fontSize: sp(12),
    fontFamily: 'Pretendard-Regular',
    textAlign: 'left',
    flexShrink: 1,
    lineHeight: sp(16),
  },
});

// text2를 넘기는 호출부가 있는데 렌더하지 않아 조용히 버려지던 것을 살린다.
const ToastBody = ({ text1, text2 }: { text1?: string; text2?: string }) => (
  <View style={toastStyles.textGroup}>
    <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    {text2 ? <Text style={toastStyles.subText}>{text2}</Text> : null}
  </View>
);

export const toastConfig: ToastConfig = {
  error: ({ text1, text2 }) => (
    <View style={toastStyles.container}>
      <XCircle size={18} color="#D92D20" strokeWidth={2.5} />
      <ToastBody text1={text1} text2={text2} />
    </View>
  ),
  success: ({ text1, text2 }) => (
    <View style={toastStyles.container}>
      <CheckCircle2 size={18} color="#067647" strokeWidth={2.5} />
      <ToastBody text1={text1} text2={text2} />
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={toastStyles.container}>
      <Info size={18} color={tokens.colors.primary} strokeWidth={2.5} />
      <ToastBody text1={text1} text2={text2} />
    </View>
  ),
};
