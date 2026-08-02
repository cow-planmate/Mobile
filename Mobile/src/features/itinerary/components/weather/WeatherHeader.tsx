import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherIcon from './WeatherIcon';
import { SimpleWeatherInfo } from '../../../../api/trips';
import { theme } from '../../../../theme/theme';
import LinearGradient from 'react-native-linear-gradient';

interface WeatherHeaderProps {
  dayNumber: number;
  weather: SimpleWeatherInfo;
  appearance?: 'default' | 'overlay';
}

export default function WeatherHeader({
  dayNumber,
  weather,
  appearance = 'default',
}: WeatherHeaderProps) {
  const isOverlay = appearance === 'overlay';

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
