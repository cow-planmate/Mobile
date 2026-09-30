import { view } from './storybook.requires';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore
const StorybookUIRoot = (view as any).getStorybookUI({
    storage: {
        getItem: AsyncStorage.getItem,
        setItem: AsyncStorage.setItem,
    },
});

export default StorybookUIRoot;
