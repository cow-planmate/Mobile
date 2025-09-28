// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/app/main/HomeScreen';
import ItineraryEditorScreen from '../screens/app/itinerary/ItineraryEditorScreen';
import { AppStackParamList } from './types'; // ⭐️ 1. 타입 불러오기

// ⭐️ 2. Stack에 타입 적용
const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ItineraryEditor"
        component={ItineraryEditorScreen}
        options={{ title: '일정 만들기' }}
      />
    </Stack.Navigator>
  );
}
