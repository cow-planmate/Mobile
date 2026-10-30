import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import SheetModal from '../../../components/modals/SheetModal';
import { tokens } from '../../../theme/tokens';
import { normalizeLinkUrl } from '../utils/linkUrl';
import { styles } from './FeedLinkSheet.styles';

interface FeedLinkSheetProps {
  visible: boolean;
  /** 이미 링크가 걸린 글자를 눌렀을 때의 현재 주소. 새로 거는 거면 빈 문자열. */
  initialUrl: string;
  onApply: (url: string) => void;
  /** 걸려 있는 링크를 지운다. 새로 거는 중이면 넘기지 않는다. */
  onRemove?: () => void;
  onClose: () => void;
}

export default function FeedLinkSheet({
  visible,
  initialUrl,
  onApply,
  onRemove,
  onClose,
}: FeedLinkSheetProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');

  // 열 때마다 이전에 적던 값이 남지 않게 처음 값으로 되돌린다.
  useEffect(() => {
    if (visible) {
      setUrl(initialUrl);
      setError('');
    }
  }, [visible, initialUrl]);

  const handleApply = () => {
    const normalized = normalizeLinkUrl(url);
    if (!normalized) {
      setError('올바른 링크 주소를 입력해 주세요.');
      return;
    }
    onApply(normalized);
  };

  return (
    <SheetModal
      visible={visible}
      title="링크"
      onClose={onClose}
      avoidKeyboard
      footer={
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.footerButton, styles.footerCancel]}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.footerCancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.footerApply]}
            onPress={handleApply}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.footerApplyText}>적용</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.form}>
        <Text style={styles.intro}>선택한 글자에 링크를 겁니다.</Text>
        <TextInput
          style={[styles.input, !!error && styles.inputError]}
          value={url}
          onChangeText={text => {
            setUrl(text);
            if (error) setError('');
          }}
          placeholder="https://"
          placeholderTextColor={tokens.colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          onSubmitEditing={handleApply}
          accessibilityLabel="링크 주소"
        />
        {!!error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}
        {!!onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="링크 삭제"
          >
            <Text style={styles.removeText}>링크 삭제</Text>
          </TouchableOpacity>
        )}
      </View>
    </SheetModal>
  );
}
