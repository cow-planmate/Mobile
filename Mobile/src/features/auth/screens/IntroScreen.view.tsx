import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { styles } from './IntroScreen.styles';
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
          함께 계획하고 떠나는 여행
        </Animated.Text>
        <Animated.Text style={styles.description} entering={revealStep(2)}>
          친구와 실시간으로 일정을 짜고,{'\n'}나만의 특별한 여행을 완성해 보세요.
        </Animated.Text>
      </View>

      <Animated.View
        style={styles.footer}
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
