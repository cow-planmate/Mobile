import { useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../contexts/AlertContext';

interface UnsavedChangesPromptOptions {
  hasUnsavedChanges: boolean;
  title?: string;
  message?: string;
}

/**
 * 작성 중인 내용이 있을 때 화면 이탈을 확인받는다.
 *
 * beforeRemove 하나로 헤더 뒤로가기·하드웨어 백 버튼·제스처를 모두 잡는다.
 * 저장에 성공해 화면을 넘길 때는 allowLeave()로 확인을 건너뛴다.
 */
export function useUnsavedChangesPrompt({
  hasUnsavedChanges,
  title = '작성 취소',
  message = '작성 중인 내용이 사라집니다. 나갈까요?',
}: UnsavedChangesPromptOptions) {
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const bypassRef = useRef(false);

  const allowLeave = useCallback(() => {
    bypassRef.current = true;
  }, []);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e: any) => {
        if (bypassRef.current || !hasUnsavedChanges) return;

        e.preventDefault();
        showAlert({
          title,
          message,
          type: 'confirm',
          buttons: [
            { text: '계속 작성', style: 'cancel' },
            {
              text: '나가기',
              style: 'destructive',
              onPress: () => {
                bypassRef.current = true;
                navigation.dispatch(e.data.action);
              },
            },
          ],
        });
      }),
    [navigation, showAlert, hasUnsavedChanges, title, message],
  );

  return { allowLeave };
}
