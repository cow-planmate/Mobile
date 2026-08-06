import { view } from './storybook.requires';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storybook 객체가 내부적으로 AsyncStorage를 사용하려는데 주입되지 않아 발생하는 오류일 수 있습니다.
// 또는 view 객체의 초기화가 덜 된 상태일 수 있습니다.

// 안전하게 컴포넌트를 생성하여 반환합니다.
// @ts-ignore
const StorybookUIRoot = (view as any).getStorybookUI({
    storage: {
        getItem: AsyncStorage.getItem,
        setItem: AsyncStorage.setItem,
    },
});

export default StorybookUIRoot;
