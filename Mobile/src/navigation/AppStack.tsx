import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeScreen from '../features/home/screens/HomeScreen';
import ItineraryEditorScreen from '../features/itinerary/screens/ItineraryEditorScreen';
import ItineraryViewScreen from '../features/itinerary/screens/ItineraryViewScreen';
import MyScheduleScreen from '../features/itinerary/screens/MyScheduleScreen';
import ProfileScreen from '../features/auth/screens/ProfileScreen';
import ThemeSettingsScreen from '../features/auth/screens/ThemeSettingsScreen';
import ChangePasswordScreen from '../features/auth/screens/ChangePasswordScreen';
import { CommunityScreen } from '../features/community';
import { MapScreen } from '../features/places';
import {
  TabParamList,
  ScheduleStackParamList,
  CommunityStackParamList,
  MapStackParamList,
  ProfileStackParamList,
} from './types';
import { Platform } from 'react-native';
import { Calendar, MessageSquare, Map, User } from 'lucide-react-native';

const ScheduleStackNavigator = createNativeStackNavigator<ScheduleStackParamList>();
const CommunityStackNavigator = createNativeStackNavigator<CommunityStackParamList>();
const MapStackNavigator = createNativeStackNavigator<MapStackParamList>();
const ProfileStackNavigator = createNativeStackNavigator<ProfileStackParamList>();

const Tab = createBottomTabNavigator<TabParamList>();

const baseTabBarStyle = {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
  height: Platform.OS === 'ios' ? 85 : 60,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
  elevation: 0,
};

const isItineraryEditorFocused = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  return routeName === 'ItineraryEditor';
};

function ScheduleStack() {
  return (
    <ScheduleStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <ScheduleStackNavigator.Screen
        name="MySchedule"
        component={MyScheduleScreen}
      />
      <ScheduleStackNavigator.Screen
        name="Home"
        component={HomeScreen}
      />
      <ScheduleStackNavigator.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <ScheduleStackNavigator.Screen
        name="ItineraryEditor"
        component={ItineraryEditorScreen}
      />
      <ScheduleStackNavigator.Screen
        name="ItineraryView"
        component={ItineraryViewScreen}
      />
    </ScheduleStackNavigator.Navigator>
  );
}

function CommunityStack() {
  return (
    <CommunityStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <CommunityStackNavigator.Screen
        name="CommunityMain"
        component={CommunityScreen}
      />
    </CommunityStackNavigator.Navigator>
  );
}

function MapStack() {
  return (
    <MapStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <MapStackNavigator.Screen
        name="MapMain"
        component={MapScreen}
      />
    </MapStackNavigator.Navigator>
  );
}

function ProfileStack() {
  return (
    <ProfileStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <ProfileStackNavigator.Screen
        name="ProfileMain"
        component={ProfileScreen}
      />
      <ProfileStackNavigator.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
      />
      <ProfileStackNavigator.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
      />
    </ProfileStackNavigator.Navigator>
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
        component={CommunityStack}
        options={{
          title: '커뮤니티',
          tabBarIcon: CommunityTabIcon,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{
          title: '지도',
          tabBarIcon: MapTabIcon,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: '프로필',
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}
