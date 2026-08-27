import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import X from 'lucide-react-native/dist/esm/icons/x';
import { theme } from '../../theme/theme';
import { tokens } from '../../theme/tokens';
import {
  CollaborationRequestType,
  describeCollaborationRequest,
} from '../../utils/collaborationRequest';

export interface Invitation {
  requestId: number;
  senderNickname: string;
  planName: string;

  type?: CollaborationRequestType;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  invitations: Invitation[];
  onAccept: (requestId: number) => void | Promise<void>;
  onReject: (requestId: number) => void | Promise<void>;
}

const COLORS = theme.colors;
const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

const NotificationModal = ({
  visible,
  onClose,
  invitations = [],
  onAccept,
  onReject,
}: NotificationModalProps) => {
  const processingRef = useRef(new Set<number>());
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const runAction = async (
    requestId: number,
    action: (id: number) => void | Promise<void>,
  ) => {
    if (processingRef.current.has(requestId)) return;

    processingRef.current.add(requestId);
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const result = action(requestId);
      if (result) await result;
    } finally {
      processingRef.current.delete(requestId);
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

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
            <Text style={styles.title}>알림</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <X size={20} color={tokens.colors.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {invitations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>새로운 알림이 없어요.</Text>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {invitations.map(invite => (
                <View key={invite.requestId} style={styles.itemContainer}>
                  <View style={styles.textContainer}>
                    <Text style={styles.inviteText}>
                      <Text style={styles.highlight}>
                        {invite.senderNickname}
                      </Text>
                      님이{' '}
                      <Text style={styles.highlight}>{invite.planName}</Text>{' '}
                      {describeCollaborationRequest(invite.type)}
                    </Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => runAction(invite.requestId, onReject)}
                      disabled={processingIds.has(invite.requestId)}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: processingIds.has(invite.requestId),
                      }}
                      accessibilityLabel={`${invite.senderNickname}님의 요청 거절`}
                    >
                      <Text style={styles.rejectButtonText}>거절</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => runAction(invite.requestId, onAccept)}
                      disabled={processingIds.has(invite.requestId)}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: processingIds.has(invite.requestId),
                      }}
                      accessibilityLabel={`${invite.senderNickname}님의 요청 수락`}
                    >
                      <Text style={styles.acceptButtonText}>수락</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default React.memo(NotificationModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: tokens.colors.white,
    borderRadius: 20, 
    padding: 24,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.borderLight, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: tokens.colors.textTertiary,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  itemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  textContainer: {
    marginBottom: 12,
  },
  inviteText: {
    fontSize: 14,
    color: tokens.colors.text,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  highlight: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    color: tokens.colors.white,
    fontSize: 13,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: tokens.colors.borderLight,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  rejectButtonText: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
});
