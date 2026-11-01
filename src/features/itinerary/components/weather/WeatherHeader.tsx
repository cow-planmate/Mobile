import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherIcon from './WeatherIcon';
import { SimpleWeatherInfo, WeatherDataSource } from '../../../../api/trips';
import { tokens } from '../../../../theme/tokens';
import LinearGradient from 'react-native-linear-gradient';
import { WEATHER_BAND_HEIGHT } from '../editor/editorConstants';

interface WeatherHeaderProps {
  dayNumber: number;
  weather: SimpleWeatherInfo;
  /** band: 일정 편집 화면의 불투명한 고정 띠. 일차는 위 탭에 있어 적지 않는다. */
  appearance?: 'default' | 'overlay' | 'band';
}

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

  if (appearance === 'band') {
    return (
      <View style={bandStyles.band}>
        <Text style={bandStyles.temp}>{Math.round(weather.tempMax)}°</Text>
        <View style={bandStyles.text}>
          <View style={bandStyles.titleRow}>
            <Text style={bandStyles.description} numberOfLines={1}>
              {weather.description}
            </Text>
            {dataSourceLabel && (
              <Text style={bandStyles.source} numberOfLines={1}>
                {dataSourceLabel}
              </Text>
            )}
          </View>
          <Text style={bandStyles.detail} numberOfLines={1}>
            최저 {Math.round(weather.tempMin)}° · 체감{' '}
            {Math.round(weather.feelsLike ?? weather.tempMax)}°
          </Text>
        </View>
        <WeatherIcon description={weather.description} size={40} />
      </View>
    );
  }

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
            <Text style={[styles.tempValue, { color: tokens.colors.primary }]}>
              {Math.round(weather.tempMin)}°C
            </Text>
          </View>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>최고</Text>
            <Text style={[styles.tempValue, { color: tokens.tones.danger.fg }]}>
              {Math.round(weather.tempMax)}°C
            </Text>
          </View>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>체감</Text>
            <Text style={[styles.tempValue, { color: tokens.colors.text }]}>
              {Math.round(weather.feelsLike ?? weather.tempMax)}°C
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const { colors, fontFamily, fontSize, spacing } = tokens;

const bandStyles = StyleSheet.create({
  band: {
    height: WEATHER_BAND_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  temp: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.s,
  },
  description: {
    flexShrink: 1,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.s,
    color: colors.text,
  },
  source: {
    flexShrink: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  detail: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: tokens.colors.background,
    borderWidth: 1,
    borderColor: tokens.colors.border,
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
    color: tokens.colors.textSecondary,
    marginBottom: 0,
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  dataSourceText: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
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
    color: tokens.colors.textSecondary,
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
