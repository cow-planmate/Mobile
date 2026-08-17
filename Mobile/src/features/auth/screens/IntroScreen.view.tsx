import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { styles, normalize } from './IntroScreen.styles';
import AuthSubmitButton from '../components/AuthSubmitButton';
import { revealStep } from '../motion';

interface IntroScreenViewProps {
  onStart: () => void;
  onLogin: () => void;
}

const IntroScreenView = ({ onStart, onLogin }: IntroScreenViewProps) => {
  return (
    <View style={styles.container}>
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

      <Animated.View
        style={[styles.footer, { paddingBottom: normalize(16) }]}
        entering={revealStep(3)}
      >
        <AuthSubmitButton label="시작하기" onPress={onStart} />

        <View style={styles.loginPromptContainer}>
          <Text style={styles.loginPromptText}>이미 계정이 있나요?</Text>

          <Pressable
            style={styles.loginActionButton}
            onPress={onLogin}
            accessibilityRole="button"
            accessibilityLabel="로그인"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.loginActionText}>로그인</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

export default IntroScreenView;
