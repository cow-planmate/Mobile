import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import Ellipsis from 'lucide-react-native/dist/esm/icons/ellipsis';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import SheetModal from '../../../components/modals/SheetModal';
import { tokens } from '../../../theme/tokens';
import { useReportPost } from '../hooks/queries';
import { ReportReason } from '../types';
import {
  REPORT_DETAILS_MAX_LENGTH,
  REPORT_REASONS,
  canSubmitReport,
} from '../constants/report';
import { styles } from './ReportPostButton.styles';

interface ReportPostButtonProps {
  postId: number | string;
  /** 여행기(피드) 글이면 true. 신고 주소가 피드 쪽으로 갈린다. */
  feed?: boolean;
}

export default function ReportPostButton({ postId, feed = false }: ReportPostButtonProps) {
  const { showAlert } = useAlert();
  const user = useAuthStore(state => state.user);
  const report = useReportPost(postId, feed);
  const submitLock = useSubmitLock();

  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = canSubmitReport(reason, details) && !submitLock.isSubmitting;

  const handleOpen = () => {
    setMenuOpen(false);
    if (!user) {
      showAlert({ title: '로그인 필요', message: '로그인 후 신고할 수 있습니다.' });
      return;
    }
    setReason('');
    setDetails('');
    setError('');
    setSubmitted(false);
    setOpen(true);
  };

  // 접수 중에 닫으면 결과를 못 보고 같은 신고를 다시 보내게 되므로 막는다.
  const handleClose = () => {
    if (!submitLock.isSubmitting) setOpen(false);
  };

  const handleSubmit = () => {
    if (!reason || !canSubmitReport(reason, details)) return;
    return submitLock.runExclusive(async () => {
      setError('');
      try {
        await report.mutateAsync({ reason, details });
        setSubmitted(true);
      } catch (e) {
        setError(getBackendErrorMessage(e));
      }
    });
  };

  const footer = submitted ? (
    <TouchableOpacity
      style={[styles.footerButton, styles.footerSubmit]}
      onPress={() => setOpen(false)}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      <Text style={styles.footerSubmitText}>확인</Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.footerRow}>
      <TouchableOpacity
        style={[
          styles.footerButton,
          styles.footerCancel,
          submitLock.isSubmitting && styles.footerDisabled,
        ]}
        onPress={handleClose}
        disabled={submitLock.isSubmitting}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.footerCancelText}>취소</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.footerButton,
          styles.footerSubmit,
          !canSubmit && styles.footerDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
      >
        <Text style={styles.footerSubmitText}>
          {submitLock.isSubmitting ? '접수 중…' : '신고 접수'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="더보기"
      >
        <Ellipsis size={24} color={tokens.colors.text} />
      </TouchableOpacity>

      <SheetModal
        visible={menuOpen}
        title="게시글"
        onClose={() => setMenuOpen(false)}
        maxHeightRatio={0.4}
      >
        <TouchableOpacity
          style={styles.menuRow}
          onPress={handleOpen}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.menuRowDangerText}>신고하기</Text>
        </TouchableOpacity>
      </SheetModal>

      <SheetModal
        visible={open}
        title="게시글 신고"
        onClose={handleClose}
        maxHeightRatio={0.92}
        avoidKeyboard
        footer={footer}
      >
        {submitted ? (
          <View style={styles.done}>
            <CheckCircle2
              size={normalize(44)}
              color={tokens.colors.primary}
              strokeWidth={1.6}
            />
            <Text style={styles.doneTitle}>신고가 접수되었습니다</Text>
            <Text style={styles.doneText}>신고 내용은 검토를 위해 저장되었어요.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.intro}>
              문제가 되는 내용을 알려주세요. 신고 사유를 선택해 주세요.
            </Text>

            <View style={styles.reasonList} accessibilityRole="radiogroup">
              {REPORT_REASONS.map(item => {
                const selected = reason === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.reasonItem, selected && styles.reasonItemSelected]}
                    onPress={() => setReason(item.value)}
                    disabled={submitLock.isSubmitting}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.reasonTexts}>
                      <Text style={styles.reasonLabel}>{item.label}</Text>
                      <Text style={styles.reasonDescription}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.detailsLabel}>
              상세 내용{' '}
              <Text style={styles.detailsHint}>
                {reason === 'OTHER' ? '(필수)' : '(선택)'}
              </Text>
            </Text>
            <TextInput
              style={styles.detailsInput}
              value={details}
              onChangeText={setDetails}
              maxLength={REPORT_DETAILS_MAX_LENGTH}
              editable={!submitLock.isSubmitting}
              multiline
              placeholder="신고 내용을 자세히 알려주세요."
              placeholderTextColor={tokens.colors.textTertiary}
              accessibilityLabel="신고 상세 내용"
            />
            <Text style={styles.detailsCounter}>
              {details.length.toLocaleString()} / {REPORT_DETAILS_MAX_LENGTH.toLocaleString()}
            </Text>

            {!!error && (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            )}
          </ScrollView>
        )}
      </SheetModal>
    </>
  );
}
