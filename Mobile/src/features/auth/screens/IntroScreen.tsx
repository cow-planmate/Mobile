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

const EXIT_CONFIRM_WINDOW_MS = 2000;

const IntroScreen = () => {
  const navigation = useNavigation<IntroScreenNavigationProp>();

  const handleStart = () => {

    navigation.navigate('Signup');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const exitArmedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let disarmTimer: ReturnType<typeof setTimeout> | null = null;

      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (exitArmedRef.current) {
          return false; 
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

        return true; 
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
