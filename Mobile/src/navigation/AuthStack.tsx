import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import IntroScreen from '../features/auth/screens/Intro';
import LoginScreen from '../features/auth/screens/Login';
import SignupScreen from '../features/auth/screens/Signup';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';
import OAuthAdditionalInfoScreen from '../features/auth/screens/OAuthAdditionalInfoScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen
        name="Intro"
        component={IntroScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OAuthAdditionalInfo"
        component={OAuthAdditionalInfoScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
