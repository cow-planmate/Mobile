import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
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
  dayLabel?: string;
}

export default function PlanMapModal({
  visible,
  onClose,
  places,
  onApplyOptimizedOrder,
  dayLabel,
}: PlanMapModalProps) {
  // 안드로이드가 edge-to-edge를 강제해 상단바를 직접 그리는 화면은
  // 이 여백을 얹지 않으면 제목이 상태바 아래로 깔린다.
  const screenInsets = useScreenInsets();
  if (!visible) return null;

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
            <Text style={styles.title}>여행 동선</Text>
            <Text style={styles.subtitle}>
              {dayLabel ?? '선택한 일차'} · {places.length}곳
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.placeStrip}
          contentContainerStyle={styles.placeStripContent}
        >
          {places.map((place, index) => (
            <View key={place.id} style={styles.placeLabel}>
              <Text style={styles.placeNumber}>{index + 1}</Text>
              <Text style={styles.placeName} numberOfLines={1}>
                {place.name}
              </Text>
            </View>
          ))}
        </ScrollView>
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
    borderBottomColor: tokens.colors.border,
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
  },
  placeStrip: { flexGrow: 0, maxHeight: normalize(68) },
  placeStripContent: { padding: normalize(12), gap: normalize(8) },
  placeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    paddingHorizontal: normalize(12),
    minHeight: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primaryTint,
  },
  placeNumber: {
    color: tokens.colors.primary,
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(13),
  },
  placeName: {
    maxWidth: normalize(180),
    color: tokens.colors.text,
    fontFamily: tokens.fontFamily.medium,
    fontSize: normalize(13),
  },
});
