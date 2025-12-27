import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/app/main/HomeScreen';
import ItineraryEditorScreen from '../screens/app/itinerary/ItineraryEditorScreen';

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
      {}
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
