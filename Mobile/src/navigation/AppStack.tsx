// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // ⭐️ 1. 탭 네비게이터 import
import HomeScreen from '../screens/app/main/HomeScreen';
import ItineraryEditorScreen from '../screens/app/itinerary/ItineraryEditorScreen';
import AddPlaceScreen from '../screens/app/itinerary/AddPlaceScreen';
import ItineraryViewScreen from '../screens/app/itinerary/ItineraryViewScreen';
import MyPageScreen from '../screens/app/main/MyPageScreen'; // ⭐️ 2. 마이페이지 import
import { AppStackParamList } from './types';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator(); // ⭐️ 3. 탭 네비게이터 생성

// ⭐️ 4. '홈' 탭에 속한 화면들을 관리하는 스택
function HomeStack() {
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
      <Stack.Screen name="ItineraryView" component={ItineraryViewScreen} />
    </Stack.Navigator>
  );
}

// ⭐️ 5. '마이페이지' 탭에 속한 화면들을 관리하는 스택 (현재는 하나)
function MyPageStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ headerShown: false }}
      />
      {/* 여기에 나중에 비밀번호 변경 화면 등을 추가할 수 있습니다. */}
    </Stack.Navigator>
  );
}

// ⭐️ 6. 메인 하단 탭 네비게이터
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
