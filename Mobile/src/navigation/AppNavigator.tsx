import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { savePreferredThemes, PreferredThemeVO } from '../api/themes';
import { ThemeSelector, ThemeSelectorResult } from '../components/common';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, needsThemeSelection, setNeedsThemeSelection } = useAuth();

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
    }
    setNeedsThemeSelection(false);
  };


  const handleThemeClose = () => {
    setNeedsThemeSelection(false);
  };

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
