import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherIcon from './WeatherIcon';
import { SimpleWeatherInfo } from '../../api/trips';
import { theme } from '../../theme/theme';
import LinearGradient from 'react-native-linear-gradient';

interface WeatherHeaderProps {
  dayNumber: number;
  weather: SimpleWeatherInfo;
}

export default function WeatherHeader({
  dayNumber,
  weather,
}: WeatherHeaderProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0)',
          'rgba(255, 255, 255, 0.9)',
          'rgba(255, 255, 255, 1)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.vignette}
      />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <WeatherIcon description={weather.description} size={76} />
          </View>
          <View style={styles.leftText}>
            <Text style={styles.dayLabel}>{dayNumber}일차</Text>
            <Text style={styles.descriptionText}>{weather.description}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>최저</Text>
            <Text style={[styles.tempValue, { color: theme.colors.primary }]}>
              {Math.round(weather.temp_min)}°C
            </Text>
          </View>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>최고</Text>
            <Text style={[styles.tempValue, { color: theme.colors.danger }]}>
              {Math.round(weather.temp_max)}°C
            </Text>
          </View>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>체감</Text>
            <Text style={[styles.tempValue, { color: theme.colors.text }]}>
              {Math.round(weather.feels_like || weather.temp_max)}°C
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    position: 'relative',
    overflow: 'hidden',
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
  },
  iconContainer: {
    width: 64,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'visible',
  },
  leftText: {
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 0,
  },
  descriptionText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tempBlock: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tempLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
