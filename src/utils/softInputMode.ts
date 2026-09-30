import { NativeModules, Platform } from 'react-native';

const { SoftInputMode } = NativeModules;

export const setAdjustNothing = () => {
  if (Platform.OS === 'android') SoftInputMode?.setAdjustNothing();
};

export const setAdjustResize = () => {
  if (Platform.OS === 'android') SoftInputMode?.setAdjustResize();
};
