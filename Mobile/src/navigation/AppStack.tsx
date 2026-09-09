import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../features/home/screens/HomeScreen';
import ItineraryEditorScreen from '../features/itinerary/screens/ItineraryEditorScreen';
import ItineraryViewScreen from '../features/itinerary/screens/ItineraryViewScreen';
import TravelFeedScreen from '../features/itinerary/screens/TravelFeedScreen';
import ProfileScreen from '../features/auth/screens/ProfileScreen';
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
import { Platform, View, Animated, AccessibilityInfo } from 'react-native';
import MessageSquare from 'lucide-react-native/dist/esm/icons/message-square';
import Compass from 'lucide-react-native/dist/esm/icons/compass';
import PlusCircle from 'lucide-react-native/dist/esm/icons/circle-plus';
import Plus from 'lucide-react-native/dist/esm/icons/plus';

const FeedStackNavigator = createNativeStackNavigator<FeedStackParamList>();
const ScheduleStackNavigator =
  createNativeStackNavigator<ScheduleStackParamList>();
const CommunityStackNavigator =
  createNativeStackNavigator<CommunityStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

const baseTabBarStyle = {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6',
  paddingTop: 6,
  elevation: 4,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
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
      <FeedStackNavigator.Screen name="FeedMain" component={TravelFeedScreen} />
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
      <ScheduleStackNavigator.Screen name="Home" component={HomeScreen} />
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

const TabIconWrapper = ({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  React.useEffect(() => {
    if (focused) {
      if (reduceMotion) {
        scale.setValue(1);
        return;
      }
      scale.setValue(0.9);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(1);
    }
  }, [focused, reduceMotion, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
  );
};

const FeedTabIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <TabIconWrapper focused={focused}>
    <Compass size={size} color={color} strokeWidth={focused ? 2.3 : 1.8} />
  </TabIconWrapper>
);

const ScheduleTabIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <TabIconWrapper focused={focused}>
    {focused ? (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={size * 0.62} color="#FFFFFF" strokeWidth={2.4} />
      </View>
    ) : (
      <PlusCircle size={size} color={color} strokeWidth={1.8} />
    )}
  </TabIconWrapper>
);

const CommunityTabIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <TabIconWrapper focused={focused}>
    <MessageSquare
      size={size}
      color={color}
      fill={focused ? color : 'none'}
      strokeWidth={focused ? 2 : 1.8}
    />
  </TabIconWrapper>
);

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName={INITIAL_TAB}
      // 기본값 'firstRoute'는 선언 순서상 첫 탭(여행기)으로 되돌린다.
      // 앱이 시작하는 탭으로 수렴해야 하므로 initialRoute를 쓴다.
      backBehavior="initialRoute"
      screenOptions={() => ({
        headerShown: false,
        tabBarActiveTintColor: '#1344FF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontFamily: 'Pretendard-SemiBold',
          fontSize: 11,
          marginTop: 4,
        },
        tabBarStyle: {
          ...baseTabBarStyle,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 54 + Math.max(insets.bottom, 8),
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedStack}
        options={{
          title: '여행기',
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
