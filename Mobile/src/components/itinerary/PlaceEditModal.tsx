import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { theme } from '../../theme/theme';

const COLORS = theme.colors;

interface PlaceEditModalProps {
  visible: boolean;
  place: any;
  onClose: () => void;
  onSave: (updatedPlace: any) => void;
  onDelete: (placeId: string) => void;
}

export default function PlaceEditModal({
  visible,
  place,
  onClose,
  onSave,
  onDelete,
}: PlaceEditModalProps) {
  const [memo, setMemo] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  useEffect(() => {
    if (visible && place) {
      setMemo(place.memo || '');
      // Parse time string "HH:mm:ss" to Date object
      const today = new Date();
      const [sh, sm] = (place.startTime || '09:00').split(':').map(Number);
      const [eh, em] = (place.endTime || '10:00').split(':').map(Number);

      const sDate = new Date(today);
      sDate.setHours(sh, sm, 0);
      setStartTime(sDate);

      const eDate = new Date(today);
      eDate.setHours(eh, em, 0);
      setEndTime(eDate);
    }
  }, [visible, place]);

  const handleSave = () => {
    const formatTime = (date: Date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}:00`;
    };

    onSave({
      ...place,
      memo,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(place.id || place.placeId);
    onClose();
  };

  if (!place) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>장소 수정</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.placeName}>{place.name}</Text>

            <View style={styles.row}>
              <View style={styles.timeContainer}>
                <Text style={styles.label}>시작 시간</Text>
                <TouchableOpacity
                  onPress={() => setOpenStartPicker(true)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeText}>
                    {startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeContainer}>
                <Text style={styles.label}>종료 시간</Text>
                <TouchableOpacity
                  onPress={() => setOpenEndPicker(true)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeText}>
                    {endTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>메모</Text>
              <TextInput
                style={styles.input}
                value={memo}
                onChangeText={setMemo}
                placeholder="메모를 입력하세요"
                multiline
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={[styles.buttonText, styles.deleteText]}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>

          <DatePicker
            modal
            open={openStartPicker}
            date={startTime}
            mode="time"
            onConfirm={date => {
              setOpenStartPicker(false);
              setStartTime(date);
            }}
            onCancel={() => {
              setOpenStartPicker(false);
            }}
          />
          <DatePicker
            modal
            open={openEndPicker}
            date={endTime}
            mode="time"
            onConfirm={date => {
              setOpenEndPicker(false);
              setEndTime(date);
            }}
            onCancel={() => {
              setOpenEndPicker(false);
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  content: {
    gap: 16,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  saveButton: {
    backgroundColor: COLORS.primary || '#007AFF', // Fallback color
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteText: {
    color: '#D32F2F',
  },
});
