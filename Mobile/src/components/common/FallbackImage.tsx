import React, { useEffect, useState } from 'react';
import { StyleProp } from 'react-native';
import FastImage, {
  ImageStyle,
  Priority,
  ResizeMode,
} from 'react-native-fast-image';

interface FallbackImageProps {
  uri?: string | null;
  style: StyleProp<ImageStyle>;

  /** uri가 없거나 로딩에 실패했을 때 대신 그릴 것 */
  fallback: React.ReactNode;

  priority?: Priority;
  resizeMode?: ResizeMode;
  accessible?: boolean;
  accessibilityLabel?: string;
}

/**
 * 로딩에 실패하면 대체 표시로 내려가는 이미지.
 *
 * uri가 바뀌면 실패 상태를 반드시 되돌린다 — 목록에서 행이 재활용될 때
 * 앞 항목의 실패가 다음 항목에 눌러붙던 문제가 있었다.
 */
export default function FallbackImage({
  uri,
  style,
  fallback,
  priority = FastImage.priority.normal,
  resizeMode = FastImage.resizeMode.cover,
  accessible,
  accessibilityLabel,
}: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return <>{fallback}</>;
  }

  return (
    <FastImage
      source={{ uri, priority }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
