import React from 'react';
import { View, Text } from 'react-native';
import {
  styles,
  HOUR_HEIGHT,
} from '../../screens/ItineraryEditorScreen.styles';

const TimeGridBackground = React.memo(
  ({ hours, endHour }: { hours: number[]; endHour: number }) => {
    const hourStr = (h: number) => h.toString().padStart(2, '0');

    return (
      <View style={styles.gridContainer} pointerEvents="none">
        {hours.map(hour => {
          const isLastHour = hour === endHour;
          return (
            <View
              key={hour}
              style={[
                styles.hourBlock,
                isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
              ]}
            >
              <View
                style={[
                  styles.hourLabelContainer,
                  isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
                ]}
              >
                <Text style={[styles.timeLabelText, styles.timeLabelTop]}>
                  {`${hourStr(hour)}:00`}
                </Text>
                {!isLastHour && (
                  <>
                    <Text
                      style={[
                        styles.timeLabelText,
                        styles.minuteLabel,
                        { top: HOUR_HEIGHT / 4 },
                      ]}
                    >
                      {`${hourStr(hour)}:15`}
                    </Text>
                    <Text
                      style={[
                        styles.timeLabelText,
                        styles.minuteLabel,
                        { top: HOUR_HEIGHT / 2 },
                      ]}
                    >
                      {`${hourStr(hour)}:30`}
                    </Text>
                    <Text
                      style={[
                        styles.timeLabelText,
                        styles.minuteLabel,
                        { top: (HOUR_HEIGHT * 3) / 4 },
                      ]}
                    >
                      {`${hourStr(hour)}:45`}
                    </Text>
                  </>
                )}
              </View>

              <View
                style={[
                  styles.hourContent,
                  isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
                ]}
              >
                <View
                  style={[
                    styles.quarterBlock,
                    styles.firstQuarterBlock,
                    isLastHour && styles.lastHourBorder,
                  ]}
                />
                {!isLastHour && (
                  <>
                    <View style={styles.quarterBlock} />
                    <View style={styles.quarterBlock} />
                    <View style={styles.quarterBlock} />
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  },
);


export default TimeGridBackground;
