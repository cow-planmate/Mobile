import type { Meta, StoryObj } from '@storybook/react';
import IntroScreenView from './IntroScreen.view';

const meta = {
  title: 'Screens/Auth/IntroScreen',
  component: IntroScreenView,
  args: {
    onStart: () => console.log('onStart'),
    onLogin: () => console.log('onLogin'),
  },
} satisfies Meta<typeof IntroScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
