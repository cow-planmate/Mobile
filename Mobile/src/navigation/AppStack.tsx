import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../screens/app/main/MainScreen';
import ItineraryCreationScreen from '../screens/app/itinerary/ItineraryCreationScreen';

import ItineraryCompletionScreen from '../screens/app/itinerary/ItineraryCompletionScreen';
import MyPageScreen from '../screens/app/main/MyPageScreen';
import { AppStackParamList } from './types';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ItineraryCreation"
        component={ItineraryCreationScreen}
      />
      {}
      <Stack.Screen
        name="ItineraryCompletion"
        component={ItineraryCompletionScreen}
      />
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

const HomeTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🏠</Text>
);

const MyPageTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>👤</Text>
);

export default function AppStack() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: '홈',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="MyPageTab"
        component={MyPageStack}
        options={{
          title: '마이페이지',
          tabBarIcon: MyPageTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}
