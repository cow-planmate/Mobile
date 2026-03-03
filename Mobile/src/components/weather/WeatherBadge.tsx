import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherIcon from './WeatherIcon';

interface WeatherBadgeProps {
  description: string;
  tempMin: number;
  tempMax: number;
  /** Render in a light style (for selected/primary-bg day tabs) */
  light?: boolean;
  size?: 'small' | 'medium';
}

export default function WeatherBadge({
  description,
  tempMin,
  tempMax,
  light = false,
  size = 'small',
}: WeatherBadgeProps) {
  const iconSize = size === 'small' ? 18 : 24;

  return (
    <View style={s.container}>
      <WeatherIcon description={description} size={iconSize} />
      <Text style={[s.tempText, light && s.tempTextLight]}>
        {Math.round(tempMin)}°/{Math.round(tempMax)}°
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  tempText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
  },
  tempTextLight: {
    color: 'rgba(255,255,255,0.85)',
  },
});
