import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import Send from 'lucide-react-native/dist/esm/icons/send';
import BackTopBar from '../../../components/common/BackTopBar';
import { useAlert } from '../../../contexts/AlertContext';
import { useScreenInsets } from '../../../hooks/useScreenInsets';
import { useAuthStore } from '../../../store/useAuthStore';
import { tokens } from '../../../theme/tokens';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { normalize } from '../../../utils/normalize';
import type { AppStackParamList } from '../../../navigation/types';
import { markRoomRead, openChatRoom } from '../api';
import { useMessages, useSendMessage } from '../hooks';
import { styles } from './ChatScreen.styles';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

/** 1:1 쪽지 — 상대와의 방을 열고(없으면 생성) 보이는 마지막 메시지까지 읽음 처리한다 */
export default function ChatScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, 'Chat'>>();
  const { showAlert } = useAlert();
  const qc = useQueryClient();
  const screenInsets = useScreenInsets();
  const myUserId = useAuthStore(state => state.user?.userId);
  const [roomId, setRoomId] = useState<number>();
  const [text, setText] = useState('');
  const { data, isLoading } = useMessages(roomId);
  const send = useSendMessage(roomId);
  // 서버가 최신순으로 주므로 inverted 목록에 그대로 넣으면 최신이 아래에 온다
  const messages = data?.messages ?? [];
  const latestId = messages[0]?.id;

  useEffect(() => {
    openChatRoom(params.userId)
      .then(room => setRoomId(room.roomId))
      .catch(error => showAlert({ title: '쪽지를 열 수 없어요', message: getBackendErrorMessage(error), type: 'error' }));
  }, [params.userId, showAlert]);

  useEffect(() => {
    if (roomId == null || latestId == null) return;
    markRoomRead(roomId, latestId)
      .then(() => qc.invalidateQueries({ queryKey: ['social', 'rooms'] }))
      .catch(() => {});
  }, [roomId, latestId, qc]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || roomId == null || send.isPending) return;
    try {
      await send.mutateAsync(content);
      setText('');
    } catch (error) {
      showAlert({ title: '전송 실패', message: getBackendErrorMessage(error), type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, screenInsets]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.white} />
      <BackTopBar title={params.nickname} onBack={() => navigation.goBack()} />

      {roomId == null || isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : (
        <FlatList
          inverted
          data={messages}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, styles.flipped]}>{params.nickname}님에게 첫 쪽지를 보내보세요.</Text>
          }
          renderItem={({ item }) => {
            const mine = item.senderId === myUserId;
            return (
              <View style={[styles.row, mine && styles.rowMine]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine, item.deleted && styles.deletedText]}>
                    {item.deleted ? '삭제된 메시지입니다' : item.content}
                  </Text>
                </View>
                <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
              </View>
            );
          }}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="메시지를 입력하세요"
          placeholderTextColor={tokens.colors.textTertiary}
          maxLength={1000}
          multiline
          editable={roomId != null}
          accessibilityLabel="쪽지 내용"
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || send.isPending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || send.isPending}
          accessibilityRole="button"
          accessibilityLabel="보내기"
        >
          <Send size={normalize(18)} color={tokens.colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
