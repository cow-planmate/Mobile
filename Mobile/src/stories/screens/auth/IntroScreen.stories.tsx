import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import IntroScreenView from '../../../screens/auth/IntroScreen.view';

const meta = {
  title: 'Screens/Auth/IntroScreen',
  component: IntroScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    onStart: () => console.log('Start button pressed'),
    onLogin: () => console.log('Login button pressed'),
  },
} satisfies Meta<typeof IntroScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
