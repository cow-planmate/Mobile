import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import XIcon from 'lucide-react-native/dist/esm/icons/x';
import RouteMapSection from './RouteMapSection';
import { MapPlace } from './KakaoMapView';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { useScreenInsets } from '../../../hooks/useScreenInsets';

export interface PlanMapModalProps {
  visible: boolean;
  onClose: () => void;
  places: MapPlace[];
  onApplyOptimizedOrder?: (orderedPlaceIds: string[]) => void;
}

export default function PlanMapModal({
  visible,
  onClose,
  places,
  onApplyOptimizedOrder,
}: PlanMapModalProps) {
  // 안드로이드가 edge-to-edge를 강제해 상단바를 직접 그리는 화면은
  // 이 여백을 얹지 않으면 제목이 상태바 아래로 깔린다.
  const screenInsets = useScreenInsets();

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, screenInsets]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>일정 지도</Text>
            <Text style={styles.subtitle}>
              지금 보고 있는 일차의 장소
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            hitSlop={12}
          >
            <XIcon color={tokens.colors.textTertiary} size={normalize(20)} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <RouteMapSection
            places={places}
            onApplyOptimizedOrder={onApplyOptimizedOrder}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(14),
    paddingBottom: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: normalize(3),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  body: {
    flex: 1,
    padding: normalize(16),
  },
});
