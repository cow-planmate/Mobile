import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/screens/HomeScreen';
import ItineraryEditorScreen from '../features/itinerary/screens/ItineraryEditorScreen';
import ItineraryViewScreen from '../features/itinerary/screens/ItineraryViewScreen';
import TravelFeedScreen from '../features/itinerary/screens/TravelFeedScreen';
import ProfileScreen from '../features/auth/screens/ProfileScreen';
import ThemeSettingsScreen from '../features/auth/screens/ThemeSettingsScreen';
import ChangePasswordScreen from '../features/auth/screens/ChangePasswordScreen';
import {
  CommunityScreen,
  FeedCreateScreen,
  FeedDetailScreen,
  PostCreateScreen,
  PostDetailScreen,
} from '../features/community';

import {
  TabParamList,
  FeedStackParamList,
  ScheduleStackParamList,
  CommunityStackParamList,
  AppStackParamList,
  INITIAL_TAB,
} from './types';
import { Platform } from 'react-native';
import MessageSquare from 'lucide-react-native/dist/esm/icons/message-square';
import Compass from 'lucide-react-native/dist/esm/icons/compass';
import PlusCircle from 'lucide-react-native/dist/esm/icons/circle-plus';

const FeedStackNavigator = createNativeStackNavigator<FeedStackParamList>();
const ScheduleStackNavigator = createNativeStackNavigator<ScheduleStackParamList>();
const CommunityStackNavigator = createNativeStackNavigator<CommunityStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

const baseTabBarStyle = {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
  paddingTop: 8,
  elevation: 0,
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
      <FeedStackNavigator.Screen
        name="FeedCreate"
        component={FeedCreateScreen}
      />
      <FeedStackNavigator.Screen
        name="FeedDetail"
        component={FeedDetailScreen}
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
      <CommunityStackNavigator.Screen
        name="CommunityDetail"
        component={PostDetailScreen}
      />
      <CommunityStackNavigator.Screen
        name="CommunityCreate"
        component={PostCreateScreen}
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
      initialRouteName={INITIAL_TAB}
      // 기본값 'firstRoute'는 선언 순서상 첫 탭(피드)으로 되돌린다.
      // 앱이 시작하는 탭으로 수렴해야 하므로 initialRoute를 쓴다.
      backBehavior="initialRoute"
      screenOptions={() => ({
        headerShown: false,
        tabBarActiveTintColor: '#1344FF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontFamily: 'Pretendard-SemiBold',
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
      <Stack.Screen
        name="ItineraryEditor"
        component={ItineraryEditorScreen}
        options={{
          animation: 'none',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="ItineraryView"
        component={ItineraryViewScreen}
        options={{
          animation: 'none',
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
