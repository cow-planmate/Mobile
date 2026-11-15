import React, { useCallback, useState } from 'react';
import { StyleProp, Text, TextStyle, LayoutChangeEvent } from 'react-native';
import { normalize } from '../../../utils/normalize';

const BACK_BUTTON_WIDTH = normalize(40);
const GAP = normalize(8);

/**
 * 도구 단추를 제목과 같은 줄에 둘 수 있는지 잰다.
 *
 * 제목이 짧으면 단추가 제목 줄 오른쪽에 서고, 길어서 둘이 한 줄에 못 들어가면
 * 예전처럼 제목 아래 줄로 내려간다. 줄바꿈을 레이아웃에 맡기면 부제의 길이까지
 * 섞여 판정이 흔들려서, 제목 글자 폭을 따로 재어 직접 비교한다.
 *
 * 처음 한 번 재기 전에는 내려간 모양(예전 모습)으로 그린다.
 */
export function useInlineToolbar({
  /** 제목 오른쪽에 항상 붙는 것(정보 아이콘 등)의 폭 */
  reservedWidth = 0,
  /** false면 항상 내려간 모양. 이름을 고치는 중처럼 입력칸이 줄을 다 쓰는 때. */
  enabled = true,
}: { reservedWidth?: number; enabled?: boolean } = {}) {
  const [rowWidth, setRowWidth] = useState(0);
  const [toolsWidth, setToolsWidth] = useState(0);
  const [titleWidth, setTitleWidth] = useState(0);

  const onRowLayout = useCallback(
    (e: LayoutChangeEvent) => setRowWidth(e.nativeEvent.layout.width),
    [],
  );
  const onToolsLayout = useCallback(
    (e: LayoutChangeEvent) => setToolsWidth(e.nativeEvent.layout.width),
    [],
  );
  const onTitleMeasure = useCallback(
    (e: LayoutChangeEvent) => setTitleWidth(e.nativeEvent.layout.width),
    [],
  );

  const inline =
    enabled &&
    rowWidth > 0 &&
    toolsWidth > 0 &&
    titleWidth > 0 &&
    BACK_BUTTON_WIDTH + titleWidth + reservedWidth + GAP + toolsWidth <=
      rowWidth;

  return { inline, onRowLayout, onToolsLayout, onTitleMeasure };
}

/**
 * 제목의 자연스러운 폭을 재는 보이지 않는 글자. 화면에 아무것도 그리지 않고
 * 자리도 차지하지 않는다. 한 줄에 다 안 들어가면 폭이 줄 폭으로 잡혀 넘친 것으로 판정된다.
 */
export function TitleMeasure({
  text,
  style,
  onMeasure,
}: {
  text: string;
  style: StyleProp<TextStyle>;
  onMeasure: (e: LayoutChangeEvent) => void;
}) {
  return (
    <Text
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={onMeasure}
      style={[
        style,
        {
          position: 'absolute',
          left: BACK_BUTTON_WIDTH,
          opacity: 0,
        },
      ]}
    >
      {text}
    </Text>
  );
}
