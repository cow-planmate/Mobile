import type { Meta, StoryObj } from '@storybook/react';
import AirplaneLoading from './AirplaneLoading';

const meta = {
  title: 'Components/Common/AirplaneLoading',
  component: AirplaneLoading,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AirplaneLoading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
