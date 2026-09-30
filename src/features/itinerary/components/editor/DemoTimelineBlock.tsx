import React from 'react';
import { View } from 'react-native';
import TimelineItem, { Place } from '../TimelineItem';
import {
  styles,
  MINUTE_HEIGHT,
  GRID_TOP_OFFSET,
} from '../../screens/ItineraryEditorScreen.styles';
import { timeToMinutes } from '../../../../utils/timeUtils';
import { useCoachmarkTarget } from '../../coachmark/CoachmarkContext';

/**
 * 시간표가 빈 채로 안내를 열었을 때 대신 짚어 주는 예시 블록.
 *
 * 진짜 블록과 같은 카드를 쓴다 - 흉내가 달라 보이면 "이렇게 놓인다"는 말이
 * 남지 않는다. 손가락은 먹지 않는다. 눈에만 있는 것이라 끌어도 아무 일도
 * 일어나지 않아야 하고, 끌리는 것처럼 보이면 그게 더 나쁘다.
 */
const DemoTimelineBlock = React.memo(function DemoTimelineBlock({
  place,
  offsetMinutes,
  visible,
  onEditTime,
  onEditPlace,
  onShowDetail,
  isTourRunning = true,
}: {
  place: Place;
  offsetMinutes: number;
  visible: boolean;
  onEditTime?: (type: 'startTime' | 'endTime') => void;
  onEditPlace?: () => void;
  onShowDetail?: () => void;
  isTourRunning?: boolean;
}) {
  const blockTarget = useCoachmarkTarget('timelineBlock');
  const top =
    GRID_TOP_OFFSET +
    (timeToMinutes(place.startTime) - offsetMinutes) * MINUTE_HEIGHT;
  const height =
    (timeToMinutes(place.endTime) - timeToMinutes(place.startTime)) *
    MINUTE_HEIGHT;

  return (
    <View
      ref={blockTarget}
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[
        styles.timelineDemoBlock,
        { top, height },
        visible ? null : styles.timelineDemoHidden,
      ]}
    >
      <TimelineItem
        item={place}
        isTourAnchor
        isTourRunning={isTourRunning}
        onEditTime={onEditTime}
        onEditPlace={onEditPlace}
        onShowDetail={onShowDetail}
        style={styles.flex1}
      />
    </View>
  );
});

export default DemoTimelineBlock;
