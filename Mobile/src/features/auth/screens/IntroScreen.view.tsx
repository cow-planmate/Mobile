import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles, normalize } from './IntroScreen.styles';
import AuthSubmitButton from '../components/AuthSubmitButton';

interface IntroScreenViewProps {
  onStart: () => void;
  onLogin: () => void;
}

const IntroScreenView = ({ onStart, onLogin }: IntroScreenViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/android-chrome-192x192.png')}
            style={styles.logoImage}
            accessibilityIgnoresInvertColors
            accessible={false}
          />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          어디서든 함께 하는 플랜메이트
        </Text>
        <Text style={styles.description}>
          친구와 함께하는 더 즐거운 여행,{'\n'}편리한 동시 여행 일정 생성을
          시작해보세요!
        </Text>
      </View>

      {/* 하단 여백은 기기가 알려 주는 값을 쓴다. 고정하면 제스처 바에 깔린다. */}
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + normalize(16) }]}
      >
        <AuthSubmitButton label="시작하기" onPress={onStart} />

        <View style={styles.loginPromptContainer}>
          <Text style={styles.loginPromptText}>이미 계정이 있나요?</Text>
          {/* 텍스트 크기 그대로 두면 손가락이 닿지 않는다. 48dp를 채운다. */}
          <Pressable
            style={styles.loginActionButton}
            onPress={onLogin}
            accessibilityRole="button"
            accessibilityLabel="로그인"
          >
            <Text style={styles.loginActionText}>로그인</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default IntroScreenView;
