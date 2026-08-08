import type { Meta, StoryObj } from '@storybook/react';
import IntroScreenView from './IntroScreen.view';

const meta = {
  title: 'Auth/Intro',
  component: IntroScreenView,
  args: {
    onStart: () => console.log('start'),
    onLogin: () => console.log('login'),
  },
} satisfies Meta<typeof IntroScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
