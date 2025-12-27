
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function AppNavigator() {
  const { user } = useAuth();


  return user ? <AppStack /> : <AuthStack />;
}
