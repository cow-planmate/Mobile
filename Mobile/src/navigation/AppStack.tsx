import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/screens/HomeScreen';
import ItineraryEditorScreen from '../features/itinerary/screens/ItineraryEditorScreen';
import ItineraryViewScreen from '../features/itinerary/screens/ItineraryViewScreen';
import MyScheduleScreen from '../features/itinerary/screens/MyScheduleScreen';
import TravelFeedScreen from '../features/itinerary/screens/TravelFeedScreen';
import ProfileScreen from '../features/auth/screens/ProfileScreen';
import ThemeSettingsScreen from '../features/auth/screens/ThemeSettingsScreen';
import ChangePasswordScreen from '../features/auth/screens/ChangePasswordScreen';
import { CommunityScreen } from '../features/community';
import { SocialScreen } from '../features/social';

import {
  TabParamList,
  FeedStackParamList,
  ScheduleStackParamList,
  CommunityStackParamList,
} from './types';
import { Platform } from 'react-native';
import { Calendar, MessageSquare, Compass, PlusCircle } from 'lucide-react-native';

const FeedStackNavigator = createNativeStackNavigator<FeedStackParamList>();
const ScheduleStackNavigator = createNativeStackNavigator<ScheduleStackParamList>();
const CommunityStackNavigator = createNativeStackNavigator<CommunityStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator();

const baseTabBarStyle = {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
  height: Platform.OS === 'ios' ? 85 : 60,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
  elevation: 0,
  marginBottom: Platform.OS === 'ios' ? 10 : 6,
};

function FeedStack() {
  return (
    <FeedStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <FeedStackNavigator.Screen
        name="FeedMain"
        component={TravelFeedScreen}
      />
    </FeedStackNavigator.Navigator>
  );
}

function ScheduleStack() {
  return (
    <ScheduleStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <ScheduleStackNavigator.Screen
        name="Home"
        component={HomeScreen}
      />
      <ScheduleStackNavigator.Screen
        name="MySchedule"
        component={ProfileScreen}
      />
      <ScheduleStackNavigator.Screen
        name="ItineraryEditor"
        component={ItineraryEditorScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <ScheduleStackNavigator.Screen
        name="ItineraryView"
        component={ItineraryViewScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
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

const FeedTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Compass size={size} color={color} strokeWidth={1.8} />
);

const ScheduleTabIcon = ({ color, size }: { color: string; size: number }) => (
  <PlusCircle size={size} color={color} strokeWidth={1.8} />
);

const CommunityTabIcon = ({ color, size }: { color: string; size: number }) => (
  <MessageSquare size={size} color={color} strokeWidth={1.8} />
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        headerShown: false,
        tabBarActiveTintColor: '#1344FF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          marginTop: -2,
        },
        tabBarStyle: baseTabBarStyle,
        tabBarIconStyle: {
          marginBottom: -2,
        },
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedStack}
        options={{
          title: '피드',
          tabBarIcon: FeedTabIcon,
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleStack}
        options={{
          title: '일정 생성',
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
    </Tab.Navigator>
  );
}

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Social" component={SocialScreen} />
    </Stack.Navigator>
  );
}
