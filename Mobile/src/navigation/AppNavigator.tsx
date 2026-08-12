import React from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { savePreferredThemes, PreferredThemeVO } from '../api/themes';
import ThemeSelector, { ThemeSelectorResult } from '../components/common/ThemeSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

/**
 * 최상위 루트 네비게이션 스택 타입 정의
 */
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 인증 상태(로그인 여부)에 따라 인증 스택과 메인 앱 스택을 분기하는 최상위 네비게이터
 */
export default function AppNavigator() {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const needsThemeSelection = useAuthStore((state) => state.needsThemeSelection);
  const setNeedsThemeSelection = useAuthStore((state) => state.setNeedsThemeSelection);

  const handleThemeComplete = async (selections: ThemeSelectorResult) => {
    try {
      const allThemeIds: number[] = [];
      Object.values(selections).forEach(themes => {
        themes.forEach((t: PreferredThemeVO) => allThemeIds.push(t.preferredThemeId));
      });
      if (allThemeIds.length > 0) {
        await savePreferredThemes(allThemeIds);
      }
    } catch (error) {
      console.error('Failed to save preferred themes:', error);
      // 이 선택 화면은 가입 직후 한 번만 열린다. 실패를 알리지 않으면 저장된 줄
      // 알고 넘어가고, 다시 고를 기회도 없다.
      Toast.show({
        type: 'error',
        text1: '선호 테마를 저장하지 못했어요.',
        text2: '마이페이지에서 다시 설정할 수 있어요.',
        position: 'top',
        visibilityTime: 3500,
      });
    }
    setNeedsThemeSelection(false);
  };


  const handleThemeClose = () => {
    setNeedsThemeSelection(false);
  };

  // 저장소 복원이 끝나기 전에는 스택을 결정하지 않는다.
  // (로그인 상태인데도 로그인 화면이 잠깐 노출되는 문제 방지)
  if (isInitializing) {
    return (
      <View style={styles.splash}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
      <ThemeSelector
        visible={needsThemeSelection && !!user}
        onClose={handleThemeClose}
        onComplete={handleThemeComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
