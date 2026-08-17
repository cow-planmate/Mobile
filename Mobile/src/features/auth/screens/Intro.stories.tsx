import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import IntroScreenView from './IntroScreen.view';

const meta = {
  title: 'Auth/인트로',
  component: IntroScreenView,
  args: {
    onStart: action('onStart'),
    onLogin: action('onLogin'),
  },
} satisfies Meta<typeof IntroScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
