import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { styles } from './IntroScreen.styles';

interface IntroScreenViewProps {
  onStart: () => void;
  onLogin: () => void;
}

const IntroScreenView = ({ onStart, onLogin }: IntroScreenViewProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/android-chrome-192x192.png')}
            style={styles.logoImage}
          />
        </View>
        <Text style={styles.title}>어디서든 함께 하는 플랜메이트</Text>
        <Text style={styles.description}>
          친구와 함께하는 더 즐거운 여행,{'\n'}편리한 동시 여행 일정 생성을
          시작해보세요!
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>

        <View style={styles.loginPromptContainer}>
          <Text style={styles.loginPromptText}>이미 계정이 있나요?</Text>
          <TouchableOpacity onPress={onLogin}>
            <Text style={styles.loginActionText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IntroScreenView;
