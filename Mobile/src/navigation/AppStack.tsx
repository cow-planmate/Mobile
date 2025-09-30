// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/app/main/HomeScreen';
import ItineraryEditorScreen from '../screens/app/itinerary/ItineraryEditorScreen';
import AddPlaceScreen from '../screens/app/itinerary/AddPlaceScreen'; // ⭐️ 1. 새로 추가
import { AppStackParamList } from './types';

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
      {/* ⭐️ 2. 장소 추가 화면을 모달 형태로 추가 */}
      <Stack.Screen
        name="AddPlace"
        component={AddPlaceScreen}
        options={{ title: '장소 추가', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
