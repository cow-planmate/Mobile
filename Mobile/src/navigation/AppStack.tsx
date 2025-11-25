// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/app/main/HomeScreen';
import ItineraryEditorScreen from '../screens/app/itinerary/ItineraryEditorScreen';
// import AddPlaceScreen from '../screens/app/itinerary/AddPlaceScreen'; // 제거
import ItineraryViewScreen from '../screens/app/itinerary/ItineraryViewScreen';
import MyPageScreen from '../screens/app/main/MyPageScreen';
import { AppStackParamList } from './types';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ItineraryEditor" component={ItineraryEditorScreen} />
      {/* AddPlaceScreen 스크린 등록 부분을 제거합니다.
      <Stack.Screen
        name="AddPlace"
        component={AddPlaceScreen}
        options={{ presentation: 'modal' }}
      /> 
      */}
      <Stack.Screen name="ItineraryView" component={ItineraryViewScreen} />
    </Stack.Navigator>
  );
}

function MyPageStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppStack() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyPageTab"
        component={MyPageStack}
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
