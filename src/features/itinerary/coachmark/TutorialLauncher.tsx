import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CircleQuestionMark from 'lucide-react-native/dist/esm/icons/circle-question-mark';
import X from 'lucide-react-native/dist/esm/icons/x';
import {
  EDITOR_COACHMARK_KEY,
  EDITOR_TUTORIAL_NUDGE_KEY,
} from '../../../constants/storageKeys';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { useCoachmarkTarget, useCoachmarkTour } from './CoachmarkContext';

/**
 * 사용법 안내를 여는 물음표 단추와, 처음 온 사람에게 한 번 권하는 말풍선.
 *
 * 웹 CreateTutorial과 같은 짜임이다 - 안내를 들이밀지 않고 "볼래요?"만 묻는다.
 * AI 도우미 단추 바로 위, 오른쪽 아래 묶음에 둔다. 그 자리가 장소 추가 시트를
 * 따라 움직이기 때문이다. 다른 데 두면 시트를 올렸을 때 가려진다.
 */
export default function TutorialLauncher() {
  const tour = useCoachmarkTour();
  const buttonTarget = useCoachmarkTarget('tutorial');
  const [isNudgeVisible, setNudgeVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      AsyncStorage.getItem(EDITOR_TUTORIAL_NUDGE_KEY),
      // 옛 키가 있으면 자동 안내를 이미 끝까지 본 사람이다. 그 사람에게
      // 사용법을 새로 권하면 처음부터 다시 하라는 말로 읽힌다.
      AsyncStorage.getItem(EDITOR_COACHMARK_KEY),
    ])
      .then(([dismissed, seenLegacyTour]) => {
        if (alive && !dismissed && !seenLegacyTour) setNudgeVisible(true);
      })
      // 저장소를 못 읽으면 권하지 않는다. 말풍선 하나 때문에 매번 들이밀 수 없다.
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const dismissNudge = useCallback(() => {
    setNudgeVisible(false);
    AsyncStorage.setItem(EDITOR_TUTORIAL_NUDGE_KEY, '1').catch(() => {});
  }, []);

  // 열어 본 사람에게 같은 권유를 또 할 이유가 없다 - 웹도 열면서 말풍선을 접는다.
  const openTour = useCallback(() => {
    dismissNudge();
    tour?.openTour();
  }, [dismissNudge, tour]);

  if (!tour) return null;

  /**
   * 안내 중에는 숨는다. 다만 자리는 남겨 둔다 - 마지막에 이 단추를 짚어 주는데,
   * 안내가 순서를 정할 때 잴 수 없으면 그 단계가 목록에서 빠진다.
   * 제 차례가 오면 다시 보이고, 그때도 눌리지는 않는다.
   */
  const isRunning = tour.isRunning;
  const isTourStep = tour.activeTarget === 'tutorial';

  return (
    <View
      style={styles.wrap}
      pointerEvents={isRunning ? 'none' : 'box-none'}
    >
      {!isRunning && isNudgeVisible && (
        <View style={styles.nudge}>
          <Text style={styles.nudgeTitle}>일정 만들기가 처음인가요?</Text>
          <TouchableOpacity
            onPress={openTour}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="핵심만 빠르게 보기"
          >
            <Text style={styles.nudgeLink}>핵심만 빠르게 보기 →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nudgeClose}
            onPress={dismissNudge}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="사용법 안내 닫기"
            hitSlop={10}
          >
            <X size={normalize(14)} color={tokens.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      <View
        ref={buttonTarget}
        style={isRunning && !isTourStep ? styles.hidden : null}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={openTour}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="사용법 보기"
          hitSlop={6}
        >
          <CircleQuestionMark
            size={normalize(18)}
            color={tokens.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
  },
  /** 안내 중 제 차례가 오기 전까지. 자리는 그대로 두고 보이지만 않는다. */
  hidden: {
    opacity: 0,
  },
  button: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.sub,
    // 실행 취소 단추와 같은 단계만 쓴다. 시간표 위에 살짝 뜬 정도면 충분하다.
    ...tokens.shadows.sm,
  },
  // 단추 위에 띄운다. 자리를 차지하면 아래 단추가 밀려 내려간다.
  // 오른쪽 끝에 맞춘다 - 왼쪽에 맞추면 말풍선이 화면 밖으로 나간다.
  nudge: {
    position: 'absolute',
    bottom: normalize(52),
    right: 0,
    width: normalize(250),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.sub,
    ...tokens.shadows.md,
  },
  nudgeTitle: {
    paddingRight: normalize(18),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  nudgeLink: {
    marginTop: normalize(6),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  nudgeClose: {
    position: 'absolute',
    top: normalize(8),
    right: normalize(8),
    padding: normalize(2),
  },
});
