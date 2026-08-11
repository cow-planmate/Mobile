import React, { useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';
import Toast from 'react-native-toast-message';
import IntroScreenView from './IntroScreen.view';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type IntroScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Intro'
>;

/** 이 시간 안에 다시 누르면 종료된다. */
const EXIT_CONFIRM_WINDOW_MS = 2000;

const IntroScreen = () => {
  const navigation = useNavigation<IntroScreenNavigationProp>();

  const handleStart = () => {
    // Navigate to Signup or Onboarding
    navigation.navigate('Signup');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  /**
   * 시스템 뒤로가기 — 한 번 더 눌러야 종료. Intro가 포커스일 때만 동작한다.
   *
   * Intro는 스택 최상단이라 canGoBack()이 false다. React Navigation의
   * 기본 처리는 이 상태에서 곧장 앱을 종료시키는데, 손에 쥔 채 실수로
   * 스와이프하면 아무 확인 없이 앱이 사라진다.
   *
   * native-stack은 Login·Signup으로 넘어가도 Intro를 마운트된 채로 둔다.
   * 일반 useEffect로 리스너를 붙이면 Intro가 화면 밖에 있어도 계속
   * 살아 있어, Login에서 뒤로가기를 눌러도 이 리스너가 먼저 가로챈다.
   * useFocusEffect로 붙여 포커스를 잃으면 리스너도 함께 사라지게 한다.
   */
  const exitArmedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let disarmTimer: ReturnType<typeof setTimeout> | null = null;

      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (exitArmedRef.current) {
          return false; // 처리 안 함 → 기본 동작(앱 종료)으로 넘어간다.
        }

        exitArmedRef.current = true;
        Toast.show({
          type: 'info',
          text1: '한 번 더 누르면 종료됩니다',
          position: 'top',
          visibilityTime: EXIT_CONFIRM_WINDOW_MS,
        });

        disarmTimer = setTimeout(() => {
          exitArmedRef.current = false;
        }, EXIT_CONFIRM_WINDOW_MS);

        return true; // 처리함 → 이번 back은 무시한다.
      });

      return () => {
        sub.remove();
        if (disarmTimer) clearTimeout(disarmTimer);
        exitArmedRef.current = false;
      };
    }, []),
  );

  return <IntroScreenView onStart={handleStart} onLogin={handleLogin} />;
};

export default IntroScreen;
