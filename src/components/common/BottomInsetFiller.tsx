import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../../theme/tokens';

/**
 * 화면 맨 아래, 내비게이션 바·홈 인디케이터 자리를 흰색으로 채운다.
 *
 * 비워 두면 화면 바탕색이 그대로 비쳐 바탕이 회색인 화면에서 띠로 보이고,
 * 안전 여백이 없으면 맨 아래 내용이 버튼식 내비게이션 바에 가려진다.
 * 키보드가 올라와 있으면 바가 키보드 밑으로 들어가므로 접는다.
 */
const BottomInsetFiller = () => {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const heightStyle = { height: keyboardVisible ? 0 : insets.bottom };

  return <View pointerEvents="none" style={[styles.filler, heightStyle]} />;
};

const styles = StyleSheet.create({
  filler: { backgroundColor: tokens.colors.white },
});

export default BottomInsetFiller;
