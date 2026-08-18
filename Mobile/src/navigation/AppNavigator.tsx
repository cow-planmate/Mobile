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

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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

  if (isInitializing) {
    return (
      <View style={styles.splash}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 250,
        }}
      >
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
