// src/navigation/AppNavigator.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function AppNavigator() {
  const { user } = useAuth(); // AuthContext에서 user 상태 가져오기

  // user가 있으면 AppStack을, 없으면 AuthStack을 보여줌
  return user ? <AppStack /> : <AuthStack />;
}
