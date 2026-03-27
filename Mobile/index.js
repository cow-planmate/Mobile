import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[FCM] Background message received', remoteMessage.data);
  });
} catch (error) {
  console.log(
    '[FCM] Native module is not ready yet. Run Android rebuild after Firebase setup.',
    error,
  );
}

AppRegistry.registerComponent(appName, () => App);
