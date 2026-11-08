import { Platform, StatusBar } from 'react-native';
import { toWindowY } from '../editorConstants';

describe('손끝 자리를 잰 자리의 기준으로 옮기기', () => {
  const originalOS = Platform.OS;
  const originalHeight = StatusBar.currentHeight;

  afterEach(() => {
    Platform.OS = originalOS;
    (StatusBar as { currentHeight?: number }).currentHeight = originalHeight;
  });

  it('안드로이드에서는 상태바 높이만큼 뺀다', () => {
    Platform.OS = 'android';
    (StatusBar as { currentHeight?: number }).currentHeight = 50;

    expect(toWindowY(500)).toBe(450);
  });

  it('상태바 높이를 모르면 그대로 둔다', () => {
    Platform.OS = 'android';
    (StatusBar as { currentHeight?: number }).currentHeight = undefined;

    expect(toWindowY(500)).toBe(500);
  });

  it('iOS에서는 그대로 둔다', () => {
    Platform.OS = 'ios';
    (StatusBar as { currentHeight?: number }).currentHeight = 50;

    expect(toWindowY(500)).toBe(500);
  });
});
