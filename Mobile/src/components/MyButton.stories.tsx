import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';

const MyButton = ({ text }: { text: string }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'purple',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const meta = {
  title: 'MyButton',
  component: MyButton,
} satisfies Meta<typeof MyButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    text: 'Hello Storybook',
  },
};
