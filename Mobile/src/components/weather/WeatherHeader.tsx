import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherIcon from './WeatherIcon';
import { SimpleWeatherInfo } from '../../api/trips';
import { theme } from '../../theme/theme';

interface WeatherHeaderProps {
  dayNumber: number;
  weather: SimpleWeatherInfo;
}

export default function WeatherHeader({ dayNumber, weather }: WeatherHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <WeatherIcon description={weather.description} size={32} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  leftText: {
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tempBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  tempValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});