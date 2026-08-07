import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherIcon from './WeatherIcon';
import { SimpleWeatherInfo, WeatherDataSource } from '../../../../api/trips';
import { theme } from '../../../../theme/theme';
import LinearGradient from 'react-native-linear-gradient';

interface WeatherHeaderProps {
  dayNumber: number;
  weather: SimpleWeatherInfo;
  appearance?: 'default' | 'overlay';
}

/**
 * 예보가 아닌 데이터일 때 붙일 꼬리표.
 *
 * 여행일이 예보 범위(오늘+15일)를 넘으면 서버가 작년 같은 기간 실측치를,
 * 외부 API 실패 시에는 계절 평균을 내려준다. 아무 표시 없이 예보처럼 보여주면
 * 두 달 뒤 일정을 짜는 사용자가 추정치를 예보로 오해한다.
 */
const DATA_SOURCE_LABELS: Record<WeatherDataSource, string | null> = {
  FORECAST: null,
  LAST_YEAR_ACTUAL: '작년 같은 기간 기록',
  SEASONAL_AVERAGE: '계절 평균 추정',
};

export default function WeatherHeader({
  dayNumber,
  weather,
  appearance = 'default',
}: WeatherHeaderProps) {
  const isOverlay = appearance === 'overlay';
  const dataSourceLabel = weather.dataSource
    ? DATA_SOURCE_LABELS[weather.dataSource]
    : null;

  return (
    <View style={[styles.container, isOverlay && styles.containerOverlay]}>
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0)',
          isOverlay ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.9)',
          isOverlay ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 1)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.vignette}
      />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <WeatherIcon description={weather.description} size={56} />
          </View>
          <View style={styles.leftText}>
            <Text style={styles.dayLabel}>{dayNumber}일차</Text>
            <Text
              style={styles.descriptionText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {weather.description}
            </Text>
            {dataSourceLabel && (
              <Text style={styles.dataSourceText} numberOfLines={1}>
                {dataSourceLabel}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>최저</Text>
            <Text style={[styles.tempValue, { color: theme.colors.primary }]}>
              {Math.round(weather.tempMin)}°C
            </Text>
          </View>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>최고</Text>
            <Text style={[styles.tempValue, { color: theme.colors.danger }]}>
              {Math.round(weather.tempMax)}°C
            </Text>
          </View>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>체감</Text>
            <Text style={[styles.tempValue, { color: theme.colors.text }]}>
              {Math.round(weather.feelsLike || weather.tempMax)}°C
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  containerOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderColor: 'rgba(229, 231, 235, 0.95)',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'visible',
  },
  leftText: {
    justifyContent: 'center',
    flexShrink: 1,
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 0,
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dataSourceText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tempBlock: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tempLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
