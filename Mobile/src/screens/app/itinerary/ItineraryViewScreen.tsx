// src/screens/app/itinerary/ItineraryViewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

// 임시로 AppStackParamList 타입을 가져옵니다. 실제로는 route params 타입을 정의해야 합니다.
type Props = NativeStackScreenProps<any, 'ItineraryView'>;

export default function ItineraryViewScreen({ navigation, route }: Props) {
  // const { days } = route.params; // 이전 화면에서 전달받은 데이터

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>여행 계획 완성!</Text>
      <Text style={styles.infoText}>
        {/* 'days' 배열의 길이를 통해 총 여행 기간을 표시합니다. */}총{' '}
        {route.params?.days?.length || 0}일간의 일정이 저장되었습니다.
      </Text>
      <View style={{ marginTop: 20 }}>
        <Button
          title="홈으로 돌아가기"
          onPress={() => navigation.popToTop()} // 스택의 가장 처음 화면(Home)으로 돌아갑니다.
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
