import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { styles, normalize } from './IntroScreen.styles';
import AuthSubmitButton from '../components/AuthSubmitButton';
import { revealStep } from '../motion';

interface IntroScreenViewProps {
  onStart: () => void;
  onLogin: () => void;
}

/**
 * 로고 → 제목 → 설명 → 하단 순으로 살짝 어긋나며 떠오른다.
 * 앱 첫 화면인데 지금까지 아무 등장 동작이 없어 다른 화면(AuthSubmitButton,
 * Signup 단계 전환)과 달리 정적으로 느껴졌다.
 */
const IntroScreenView = ({ onStart, onLogin }: IntroScreenViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={styles.logoContainer} entering={revealStep(0)}>
          <Image
            source={require('../../../assets/android-chrome-192x192.png')}
            style={styles.logoImage}
            accessibilityIgnoresInvertColors
            accessible={false}
          />
        </Animated.View>
        <Animated.Text
          style={styles.title}
          entering={revealStep(1)}
          accessibilityRole="header"
        >
          어디서든 함께 하는 플랜메이트
        </Animated.Text>
        <Animated.Text style={styles.description} entering={revealStep(2)}>
          친구와 함께하는 더 즐거운 여행,{'\n'}편리한 동시 여행 일정 생성을
          시작해보세요!
        </Animated.Text>
      </View>

      {/* 하단 여백은 기기가 알려 주는 값을 쓴다. 고정하면 제스처 바에 깔린다. */}
      <Animated.View
        style={[styles.footer, { paddingBottom: insets.bottom + normalize(16) }]}
        entering={revealStep(3)}
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
      </Animated.View>
    </View>
  );
};

export default IntroScreenView;
