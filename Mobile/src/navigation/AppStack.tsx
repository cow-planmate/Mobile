import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeScreen from '../features/home/screens/HomeScreen';
import ItineraryEditorScreen from '../features/itinerary/screens/ItineraryEditorScreen';

import ItineraryViewScreen from '../features/itinerary/screens/ItineraryViewScreen';
import MyScheduleScreen from '../features/itinerary/screens/MyScheduleScreen';
import ProfileScreen from '../features/auth/screens/ProfileScreen';
import { AppStackParamList } from './types';
import { View, Platform } from 'react-native';
import { Home, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const baseTabBarStyle = {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
  height: Platform.OS === 'ios' ? 85 : 60,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
  elevation: 0,
};

const isItineraryEditorFocused = (route: any) =>
  getFocusedRouteNameFromRoute(route) === 'ItineraryEditor';

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="ItineraryEditor"
        component={ItineraryEditorScreen}
        options={{
          headerShown: false,
        }}
      />
      {}
      <Stack.Screen name="ItineraryView" component={ItineraryViewScreen} />
    </Stack.Navigator>
  );
}

function MyScheduleStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen
        name="MySchedule"
        component={MyScheduleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="ItineraryEditor"
        component={ItineraryEditorScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="ItineraryView" component={ItineraryViewScreen} />
    </Stack.Navigator>
  );
}

const HomeTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Home size={size} color={color} strokeWidth={1.8} />
);

const MyScheduleTabIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <User size={size} color={color} strokeWidth={1.8} />;

export default function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1344FF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          marginTop: -2,
        },
        tabBarStyle: isItineraryEditorFocused(route)
          ? { display: 'none' }
          : baseTabBarStyle,
        tabBarIconStyle: {
          marginBottom: -2,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: '홈',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="MyScheduleTab"
        component={MyScheduleStack}
        options={{
          title: '내 일정',
          tabBarIcon: MyScheduleTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}
