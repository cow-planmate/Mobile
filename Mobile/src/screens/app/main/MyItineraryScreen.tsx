import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMyItineraryScreen } from './useMyItineraryScreen';
import { styles, COLORS } from './MyItineraryScreen.styles';
import PlanOptionModal from '../../../components/common/PlanOptionModal';

const MyItineraryScreen = () => {
  const {
    loading,
    myPlanVOs,
    editablePlanVOs,
    handlePlanPress,
    isOptionModalVisible,
    handleOptionPress,
    closeOptionModal,
    handleRename,
    handleEdit,
    handleDelete,
    handleShare,
  } = useMyItineraryScreen();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderPlanItem = (plan: any) => (
    <TouchableOpacity
      key={plan.planId}
      style={styles.planItem}
      onPress={() => handlePlanPress(plan.planId)}
      activeOpacity={0.7}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planTitle} numberOfLines={1}>
          {plan.planName}
        </Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleOptionPress(plan.planId)}
        >
          <Icon name="more-vert" size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      {plan.startDate && plan.endDate && (
        <View style={styles.planDetails}>
          <Text style={styles.icon}>🗓️</Text>
          <Text style={styles.planDate}>
            {plan.startDate} ~ {plan.endDate}
          </Text>
        </View>
      )}

      {(plan.state || plan.city) && (
        <View style={styles.planDetails}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.planLocation}>
            {plan.state} {plan.city}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerTopArea}>
          <Text style={styles.headerTitle}>나의 여행</Text>
          <Text style={styles.headerSubtitle}>
            설레는 여행의 순간들을 기록하세요
          </Text>
        </View>

        <View style={styles.whiteSection}>
          {/* 내 여행 일정 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내 여행 일정</Text>
            {myPlanVOs.length > 0 ? (
              myPlanVOs.map(renderPlanItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>
                  아직 등록된 여행이 없습니다.{'\n'}새로운 여행을 계획해보세요!
                </Text>
              </View>
            )}
          </View>

          {/* 편집 가능한 여행 일정 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>편집 가능한 여행 일정</Text>
            {editablePlanVOs.length > 0 ? (
              editablePlanVOs.map(renderPlanItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🤝</Text>
                <Text style={styles.emptyText}>
                  초대받은 여행이 없습니다.{'\n'}친구들과 여행을 공유해보세요!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <PlanOptionModal
        visible={isOptionModalVisible}
        onClose={closeOptionModal}
        onRename={handleRename}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onShare={handleShare}
      />
    </SafeAreaView>
  );
};

export default MyItineraryScreen;
