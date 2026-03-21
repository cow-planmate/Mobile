import React from 'react';
import IntroScreenView from './IntroScreen.view';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

type IntroScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Intro'
>;

const IntroScreen = () => {
  const navigation = useNavigation<IntroScreenNavigationProp>();

  const handleStart = () => {
    // Navigate to Signup or Onboarding
    navigation.navigate('Signup');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return <IntroScreenView onStart={handleStart} onLogin={handleLogin} />;
};

export default IntroScreen;
