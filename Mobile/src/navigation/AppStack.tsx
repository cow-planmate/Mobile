// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/app/main/HomeScreen';
import ItineraryEditorScreen from '../screens/app/itinerary/ItineraryEditorScreen';
import AddPlaceScreen from '../screens/app/itinerary/AddPlaceScreen';
import ItineraryViewScreen from '../screens/app/itinerary/ItineraryViewScreen'; // ⭐️ 2. 새로 추가
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
      <Stack.Screen name="ItineraryEditor" component={ItineraryEditorScreen} />
      <Stack.Screen
        name="AddPlace"
        component={AddPlaceScreen}
        options={{ presentation: 'modal' }}
      />
      {/* ⭐️ 3. 완성본 보기 화면 추가 */}
      <Stack.Screen
        name="ItineraryView"
        component={ItineraryViewScreen}
        options={{ title: '일정 확인' }}
      />
    </Stack.Navigator>
  );
}
