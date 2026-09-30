import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { styles } from './FloatingActionButton.styles';

type FloatingActionButtonProps = {
  onPress: () => void;
};

export default function FloatingActionButton({
  onPress,
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
}
