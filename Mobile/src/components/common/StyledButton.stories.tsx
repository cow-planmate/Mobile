import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { StyledButton } from './StyledButton';
import { Mail } from 'lucide-react-native';

const meta = {
  title: 'Common/StyledButton',
  component: StyledButton,
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 20,
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof StyledButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
    onPress: () => console.log('Clicked'),
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
    onPress: () => console.log('Clicked'),
  },
};

export const Outline: Story = {
  args: {
    title: 'Outline Button',
    variant: 'outline',
    onPress: () => console.log('Clicked'),
  },
};

export const Ghost: Story = {
  args: {
    title: 'Ghost Button',
    variant: 'ghost',
    onPress: () => console.log('Clicked'),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Send Email',
    icon: <Mail color="#FFFFFF" size={20} />,
    onPress: () => console.log('Clicked'),
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled',
    disabled: true,
    onPress: () => console.log('Clicked'),
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading',
    loading: true,
    onPress: () => console.log('Clicked'),
  },
};
