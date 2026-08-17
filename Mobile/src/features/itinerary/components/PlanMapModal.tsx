import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapIcon from 'lucide-react-native/dist/esm/icons/map';
import XIcon from 'lucide-react-native/dist/esm/icons/x';
import RouteMapSection from './RouteMapSection';
import { MapPlace } from './KakaoMapView';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

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
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIcon}>
              <MapIcon color={tokens.colors.primary} size={18} />
            </View>
            <View>
              <Text style={styles.title}>일정 지도</Text>
              <Text style={styles.subtitle}>
                현재 선택한 일차의 장소를 보여줍니다
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            hitSlop={8}
          >
            <XIcon color={tokens.colors.textTertiary} size={20} />
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
    paddingTop: normalize(16),
    paddingBottom: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  headerIcon: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.sub,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  subtitle: {
    marginTop: normalize(2),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  body: {
    flex: 1,
    padding: normalize(16),
  },
});
