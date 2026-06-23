import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeScreen from '../features/home/screens/HomeScreen';
import ItineraryEditorScreen from '../features/itinerary/screens/ItineraryEditorScreen';
import ItineraryViewScreen from '../features/itinerary/screens/ItineraryViewScreen';
import MyScheduleScreen from '../features/itinerary/screens/MyScheduleScreen';
import ProfileScreen from '../features/auth/screens/ProfileScreen';
import { CommunityScreen } from '../features/community';
import { MapScreen } from '../features/places';
import { AppStackParamList } from './types';
import { Platform } from 'react-native';
import { Calendar, MessageSquare, Map, User } from 'lucide-react-native';

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

function ScheduleStack() {
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
      <Stack.Screen name="ItineraryView" component={ItineraryViewScreen} />
    </Stack.Navigator>
  );
}

const ScheduleTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Calendar size={size} color={color} strokeWidth={1.8} />
);

const CommunityTabIcon = ({ color, size }: { color: string; size: number }) => (
  <MessageSquare size={size} color={color} strokeWidth={1.8} />
);

const MapTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Map size={size} color={color} strokeWidth={1.8} />
);

const ProfileTabIcon = ({ color, size }: { color: string; size: number }) => (
  <User size={size} color={color} strokeWidth={1.8} />
);

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
        name="ScheduleTab"
        component={ScheduleStack}
        options={{
          title: '일정',
          tabBarIcon: ScheduleTabIcon,
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityScreen}
        options={{
          title: '커뮤니티',
          tabBarIcon: CommunityTabIcon,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: '지도',
          tabBarIcon: MapTabIcon,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}
