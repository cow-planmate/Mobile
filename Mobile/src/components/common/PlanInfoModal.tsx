import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { styles } from './PlanInfoModal.styles';

type PlanInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  planName: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  adultCount: number;
  childCount: number;
};

export default function PlanInfoModal({
  visible,
  onClose,
  planName,
  destination,
  startDate,
  endDate,
  adultCount,
  childCount,
}: PlanInfoModalProps) {
  const dateRangeText = startDate && endDate ? `${startDate} ~ ${endDate}` : '미지정';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalView} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>일정 상세 정보</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <X size={20} color="#9CA3AF" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>일정 이름</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{planName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>여행지</Text>
              <View style={styles.destinationBadge}>
                <Text style={styles.destinationText}>{destination}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>여행 기간</Text>
              <Text style={styles.infoValue}>{dateRangeText}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>여행 인원</Text>
              <Text style={styles.infoValue}>
                성인 {adultCount}명{childCount > 0 ? `, 어린이 ${childCount}명` : ''}
              </Text>
            </View>

          </View>

          <View style={styles.confirmFooter}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
