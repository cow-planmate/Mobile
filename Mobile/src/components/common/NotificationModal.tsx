import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
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
    <PopupModal
      visible={visible}
      title="알림"
      onClose={onClose}
      doneLabel="확인"
    >
      {invitations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>새로운 알림이 없어요.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {invitations.map((invite, idx) => {
            const busy = processingIds.has(invite.requestId);
            return (
              <View
                key={invite.requestId}
                style={[styles.item, idx > 0 && styles.itemDivided]}
              >
                <Text style={styles.inviteText}>
                  <Text style={styles.highlight}>{invite.senderNickname}</Text>
                  님이 <Text style={styles.highlight}>{invite.planName}</Text>{' '}
                  {describeCollaborationRequest(invite.type)}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, styles.reject]}
                    onPress={() => runAction(invite.requestId, onReject)}
                    disabled={busy}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy }}
                    accessibilityLabel={`${invite.senderNickname}님의 요청 거절`}
                  >
                    <Text style={styles.rejectText}>거절</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.accept]}
                    onPress={() => runAction(invite.requestId, onAccept)}
                    disabled={busy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy }}
                    accessibilityLabel={`${invite.senderNickname}님의 요청 수락`}
                  >
                    <Text style={styles.acceptText}>수락</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </PopupModal>
  );
};

export default React.memo(NotificationModal);

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  empty: {
    paddingVertical: normalize(36),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  item: {
    paddingVertical: normalize(12),
    gap: normalize(10),
  },
  // 줄 사이만 가른다. 첫 줄 위와 마지막 줄 아래는 껍데기가 이미 나눠 준다.
  itemDivided: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  inviteText: {
    fontSize: normalize(13.5),
    lineHeight: normalize(20),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
  },
  highlight: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: normalize(8),
  },
  button: {
    minWidth: normalize(72),
    minHeight: normalize(44),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  accept: {
    backgroundColor: tokens.colors.primary,
  },
  acceptText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  reject: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  rejectText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
  },
});
