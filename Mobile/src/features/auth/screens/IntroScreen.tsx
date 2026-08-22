import React from 'react';
import IntroScreenView from './IntroScreen.view';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDoublePressExit } from '../../../hooks/useDoublePressExit';

type IntroScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Intro'
>;

const IntroScreen = () => {
  const navigation = useNavigation<IntroScreenNavigationProp>();

  const handleStart = () => {

    navigation.navigate('Signup');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  useDoublePressExit();

  return <IntroScreenView onStart={handleStart} onLogin={handleLogin} />;
};

export default IntroScreen;
