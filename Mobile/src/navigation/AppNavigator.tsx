
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { savePreferredThemes } from '../api/themes';
import ThemeSelector, {
  ThemeSelectorResult,
} from '../components/common/ThemeSelector';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function AppNavigator() {
  const { user, needsThemeSelection, setNeedsThemeSelection } = useAuth();

  const handleThemeComplete = async (selections: ThemeSelectorResult) => {
    try {
      const allThemeIds: number[] = [];
      Object.values(selections).forEach(themes => {
        themes.forEach(t => allThemeIds.push(t.preferredThemeId));
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
      {user ? <AppStack /> : <AuthStack />}
      <ThemeSelector
        visible={needsThemeSelection && !!user}
        onClose={handleThemeClose}
        onComplete={handleThemeComplete}
      />
    </>
  );
}
