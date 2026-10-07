import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import Check from 'lucide-react-native/dist/esm/icons/check';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import CalendarIcon from 'lucide-react-native/dist/esm/icons/calendar';
import Search from 'lucide-react-native/dist/esm/icons/search';
import Copy from 'lucide-react-native/dist/esm/icons/copy';
import Clock from 'lucide-react-native/dist/esm/icons/clock';
import X from 'lucide-react-native/dist/esm/icons/x';
import BackTopBar from '../../../components/common/BackTopBar';
import PopupModal from '../../../components/common/PopupModal';
import SearchLocationModal from '../../../components/common/SearchLocationModal';
import FeedEditor from '../components/FeedEditor';
import { POST_TITLE_MAX_LENGTH } from '../constants/board';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { styles } from './FeedCreateScreen.styles';
import { FeedPlanSnapshot } from '../utils/planToItinerary';
import { FeedImageUploadFile } from '../utils/feedImage';
import { ProfilePlan } from '../../../hooks/useUserProfile';

export interface FeedCreateScreenViewProps {
  isEditMode: boolean;
  screenInsets: any;
  onBack: () => void;
  title: string;
  onChangeTitle: (title: string) => void;
  isHydrating: boolean;
  thumbnailFile: FeedImageUploadFile | null;
  thumbnailUrl: string;
  onSelectThumbnail: () => void;
  isSubmitting: boolean;
  ownedPlans: ProfilePlan[];
  isPlanModalOpen: boolean;
  onOpenPlanModal: () => void;
  onClosePlanModal: () => void;
  isExistingPostLoading?: boolean;
  isExistingPostError?: boolean;
  isProfileLoading: boolean;
  isProfileError: boolean;
  onRefetchProfile: () => void;
  destinationLabel: string;
  snapshot: FeedPlanSnapshot | null;
  onOpenRegionModal: () => void;
  isRegionModalOpen: boolean;
  onCloseRegionModal: () => void;
  region: string;
  onSelectRegion: (location: string) => void;
  travelDays: number;
  travelNights: number;
  onDecreaseDay: () => void;
  onIncreaseDay: () => void;
  includeMemo: boolean;
  onToggleIncludeMemo: () => void;
  onRemoveSnapshot: () => void;
  durationLabel: string;
  previewDays: any[];
  initialHtml: string | null;
  onChangeContentHtml: (html: string) => void;
  planSearch: string;
  onChangePlanSearch: (search: string) => void;
  filteredPlans: ProfilePlan[];
  loadingPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  isSubmitBlocked: boolean;
  onSubmit: () => void;
  isPendingSubmit: boolean;
}

export function FeedCreateScreenView({
  isEditMode,
  screenInsets,
  onBack,
  title,
  onChangeTitle,
  isHydrating,
  thumbnailFile,
  thumbnailUrl,
  onSelectThumbnail,
  isSubmitting,
  ownedPlans,
  onOpenPlanModal,
  onClosePlanModal,
  isPlanModalOpen,
  isExistingPostLoading,
  isExistingPostError,
  isProfileLoading,
  isProfileError,
  onRefetchProfile,
  destinationLabel,
  snapshot,
  onOpenRegionModal,
  isRegionModalOpen,
  onCloseRegionModal,
  region,
  onSelectRegion,
  travelDays,
  travelNights,
  onDecreaseDay,
  onIncreaseDay,
  includeMemo,
  onToggleIncludeMemo,
  onRemoveSnapshot,
  durationLabel,
  previewDays,
  initialHtml,
  onChangeContentHtml,
  planSearch,
  onChangePlanSearch,
  filteredPlans,
  loadingPlanId,
  onSelectPlan,
  isSubmitBlocked,
  onSubmit,
  isPendingSubmit,
}: FeedCreateScreenViewProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, screenInsets]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackTopBar
        title={isEditMode ? '여행기 수정' : '여행기 쓰기'}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.group}>
          <Text style={styles.section}>기본 정보</Text>
          <Text style={styles.label}>제목</Text>
          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            style={styles.input}
            placeholder={
              isHydrating
                ? '기존 내용을 불러오는 중…'
                : '예: 서울 3박 4일 완벽 여행 코스'
            }
            editable={!isHydrating}
            maxLength={POST_TITLE_MAX_LENGTH}
            returnKeyType="next"
            accessibilityLabel="여행기 제목"
          />

          <Text style={styles.label}>썸네일</Text>
          <TouchableOpacity
            style={styles.imageSelectButton}
            onPress={onSelectThumbnail}
            disabled={isHydrating || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="썸네일 이미지 선택"
          >
            <Text style={styles.imageSelectText}>
              {thumbnailFile ? '사진 다시 선택' : '기기에서 사진 선택'}
            </Text>
          </TouchableOpacity>
          {thumbnailFile && (
            <Text style={styles.selectedImageName}>{thumbnailFile.name}</Text>
          )}
          {!thumbnailFile && !!thumbnailUrl && (
            <Text style={styles.selectedImageName}>
              현재 대표 사진을 사용합니다
            </Text>
          )}
        </View>

        <View style={[styles.group, styles.groupDivider]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.section}>여행 정보</Text>
            {!isEditMode && ownedPlans.length > 0 && (
              <TouchableOpacity
                style={styles.importPlanButton}
                onPress={onOpenPlanModal}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="내 플랜 가져오기"
              >
                <Copy size={normalize(14)} color={tokens.colors.white} />
                <Text style={styles.importPlanButtonText}>
                  내 플랜 가져오기
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditMode && isExistingPostLoading ? (
            <ActivityIndicator color={tokens.colors.primary} />
          ) : isEditMode && isExistingPostError ? (
            <Text style={styles.emptyText}>여행기를 불러올 수 없어요.</Text>
          ) : isEditMode ? null : isProfileLoading ? (
            <ActivityIndicator color={tokens.colors.primary} />
          ) : isProfileError ? (
            <Pressable onPress={onRefetchProfile}>
              <Text style={styles.emptyText}>
                일정을 불러오지 못했어요. 다시 시도하려면 눌러 주세요.
              </Text>
            </Pressable>
          ) : ownedPlans.length === 0 ? (
            <Text style={styles.emptyText}>
              발행할 내 일정이 없어요. 일정 없이 글만 올려도 돼요.
            </Text>
          ) : null}

          {/* 일정을 붙이면 여행지와 기간은 거기서 따온다. 그때는 읽기만 한다. */}
          {!isEditMode && (
            <>
              <View style={styles.fieldLabelRow}>
                <MapPin size={normalize(15)} color={tokens.colors.primary} />
                <Text style={styles.fieldLabel}>여행지 선택</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <TouchableOpacity
                style={styles.underlineField}
                onPress={onOpenRegionModal}
                disabled={!!snapshot}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="여행지 선택"
                accessibilityState={{ disabled: !!snapshot }}
              >
                <Text
                  style={[
                    styles.underlineValue,
                    !destinationLabel && styles.underlinePlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {destinationLabel || '어디로 여행을 다녀오셨나요?'}
                </Text>
                {!snapshot && (
                  <Search
                    size={normalize(20)}
                    color={tokens.colors.textTertiary}
                  />
                )}
              </TouchableOpacity>

              <View style={[styles.fieldLabelRow, styles.fieldLabelGap]}>
                <CalendarIcon
                  size={normalize(15)}
                  color={tokens.colors.primary}
                />
                <Text style={styles.fieldLabel}>여행 기간</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <View style={styles.durationRow}>
                <View style={styles.dayCountRow}>
                  <TouchableOpacity
                    style={styles.dayCountButton}
                    onPress={onDecreaseDay}
                    disabled={!!snapshot}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="기간 줄이기"
                    accessibilityState={{ disabled: !!snapshot }}
                  >
                    <Text style={styles.dayCountButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.dayCountValue}>{travelDays}일</Text>
                  <TouchableOpacity
                    style={styles.dayCountButton}
                    onPress={onIncreaseDay}
                    disabled={!!snapshot}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="기간 늘리기"
                    accessibilityState={{ disabled: !!snapshot }}
                  >
                    <Text style={styles.dayCountButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <ChevronRight
                  size={normalize(18)}
                  color={tokens.colors.borderStrong}
                />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>
                    {travelNights}박 {travelDays}일
                  </Text>
                </View>
              </View>
              <Text style={styles.fieldHint}>
                * 일자만 입력하면 숙박 일수가 자동으로 계산됩니다.
              </Text>
            </>
          )}

          <View style={styles.divider} />
          <Text style={styles.subSection}>상세 일정</Text>
          <TouchableOpacity
            style={styles.memoRow}
            onPress={onToggleIncludeMemo}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: includeMemo }}
            accessibilityLabel="일정의 개인 메모도 함께 공개"
          >
            <View style={[styles.memoBox, includeMemo && styles.memoBoxOn]}>
              {includeMemo && (
                <Check size={normalize(12)} color={tokens.colors.white} />
              )}
            </View>
            <View style={styles.memoTextWrap}>
              <Text style={styles.memoLabel}>일정의 개인 메모도 함께 공개</Text>
              <Text style={styles.memoHint}>
                켜면 일정에 적은 메모가 여행기에 표시됩니다
              </Text>
            </View>
          </TouchableOpacity>

          {snapshot && (
            <View style={styles.selectedPlanCard}>
              <View style={styles.selectedPlanLeft}>
                <View style={styles.selectedPlanIconWrap}>
                  <MapPin size={normalize(18)} color={tokens.colors.primary} />
                </View>
                <View style={styles.selectedPlanInfo}>
                  <Text style={styles.selectedPlanName} numberOfLines={1}>
                    {snapshot.planName}
                  </Text>
                  <Text style={styles.selectedPlanMeta}>
                    {snapshot.destinationName} ·{' '}
                    {snapshot.itinerary.days.length}일 일정
                  </Text>
                </View>
              </View>
              <View style={styles.planCardActions}>
                <TouchableOpacity
                  style={styles.changePlanButton}
                  onPress={onOpenPlanModal}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="일정 변경"
                >
                  <Text style={styles.changePlanButtonText}>변경</Text>
                </TouchableOpacity>
                {/* 붙이지 않아도 되는 것이므로 뺄 자리도 있어야 한다. */}
                <TouchableOpacity
                  style={styles.changePlanButton}
                  onPress={onRemoveSnapshot}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="일정 빼기"
                >
                  <Text style={styles.changePlanButtonText}>빼기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {previewDays.length > 0 ? (
            <View style={styles.itineraryPreview}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>일정 미리보기</Text>
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>{durationLabel}</Text>
                </View>
              </View>
              {previewDays.map(day => (
                <View key={day.day} style={styles.previewDay}>
                  <View style={styles.previewDayLabel}>
                    <Text style={styles.previewDayText}>DAY {day.day}</Text>
                  </View>
                  <View style={styles.previewPlaces}>
                    {day.items.slice(0, 3).map((item: any, idx: number, arr: any[]) => (
                      <View
                        key={`${day.day}-${item.time}-${item.place}-${idx}`}
                        style={styles.timelineItemRow}
                      >
                        <View style={styles.timelineTrack}>
                          <View style={styles.timelineBadge}>
                            <Text style={styles.timelineBadgeText}>
                              {idx + 1}
                            </Text>
                          </View>
                          {idx < arr.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>
                        <View
                          style={[
                            styles.timelineContent,
                            idx < arr.length - 1 &&
                              styles.timelineContentLinked,
                          ]}
                        >
                          <View style={styles.timelinePlaceHeader}>
                            <Text
                              style={styles.timelinePlaceName}
                              numberOfLines={1}
                            >
                              {item.place}
                            </Text>
                            {item.time ? (
                              <View style={styles.timelineTimeChip}>
                                <Text style={styles.timelineTimeText}>
                                  {item.time}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          {item.description ? (
                            <Text
                              style={styles.timelinePlaceDesc}
                              numberOfLines={1}
                            >
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                    {day.items.length > 3 && (
                      <Text style={styles.previewMore}>
                        외 {day.items.length - 3}곳
                      </Text>
                    )}
                    {day.items.length === 0 && (
                      <Text style={styles.previewMore}>
                        등록한 장소가 없어요.
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.scheduleEmpty}>
              <Clock size={normalize(36)} color={tokens.colors.textSecondary} />
              <Text style={styles.scheduleEmptyTitle}>
                아직 일정이 없습니다
              </Text>
              <Text style={styles.scheduleEmptySub}>
                위의 "내 플랜 가져오기" 버튼을 누르면 여행지·기간과 함께
                채워집니다
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.group, styles.groupDivider]}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.section}>여행 후기</Text>
            <Text style={styles.requiredMark}>*</Text>
          </View>

          {initialHtml === null ? (
            <ActivityIndicator color={tokens.colors.primary} />
          ) : (
            <FeedEditor
              initialHtml={initialHtml}
              editable={!isHydrating}
              placeholder="여행을 소개해 주세요"
              onChangeHtml={onChangeContentHtml}
            />
          )}
        </View>
      </ScrollView>

      {/* 지역 선택 모달 */}
      <SearchLocationModal
        visible={isRegionModalOpen}
        onClose={onCloseRegionModal}
        currentValue={region}
        onSelect={onSelectRegion}
        onDone={onCloseRegionModal}
      />

      {/* 내 플랜 선택 모달 */}
      <PopupModal
        visible={isPlanModalOpen}
        title="내 플랜 선택"
        onClose={onClosePlanModal}
        footer={null}
      >
        <View style={styles.searchBar}>
          <Search size={normalize(16)} color={tokens.colors.textTertiary} />
          <TextInput
            value={planSearch}
            onChangeText={onChangePlanSearch}
            placeholder="플랜 이름 검색..."
            placeholderTextColor={tokens.colors.textTertiary}
            style={styles.searchInput}
          />
          {planSearch.length > 0 && (
            <TouchableOpacity onPress={() => onChangePlanSearch('')} hitSlop={6}>
              <X size={normalize(14)} color={tokens.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.modalList}
          contentContainerStyle={styles.modalListContent}
        >
          {isProfileLoading ? (
            <ActivityIndicator
              color={tokens.colors.primary}
              style={{ marginVertical: normalize(24) }}
            />
          ) : filteredPlans.length === 0 ? (
            <Text style={styles.emptyText}>
              {planSearch
                ? '검색 결과가 없어요.'
                : '가져올 수 있는 일정이 없어요.'}
            </Text>
          ) : (
            filteredPlans.map(plan => {
              const selected = snapshot?.planId === plan.planId;
              const isLoading = loadingPlanId === plan.planId;
              return (
                <TouchableOpacity
                  key={plan.planId}
                  style={[
                    styles.planCard,
                    selected && styles.planCardSelected,
                  ]}
                  onPress={() => onSelectPlan(plan.planId)}
                  disabled={loadingPlanId !== null}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{plan.planName}</Text>
                    <Text style={styles.planDate}>
                      {plan.startDate ?? '일정 날짜 없음'}
                    </Text>
                  </View>
                  {isLoading ? (
                    <ActivityIndicator color={tokens.colors.primary} />
                  ) : selected ? (
                    <Check size={20} color={tokens.colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </PopupModal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitBlocked && styles.submitDisabled,
          ]}
          onPress={onSubmit}
          disabled={isSubmitBlocked}
          accessibilityRole="button"
          accessibilityLabel={isEditMode ? '수정 완료' : '피드 등록하기'}
          accessibilityState={{ disabled: isSubmitBlocked }}
        >
          <Text
            style={[styles.submitText, isSubmitBlocked && styles.submitTextOff]}
          >
            {isPendingSubmit
              ? isEditMode
                ? '수정 중…'
                : '등록 중…'
              : isEditMode
              ? '수정 완료'
              : '피드 등록하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
