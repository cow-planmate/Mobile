import type { Meta, StoryObj } from '@storybook/react';
import Intro from './Intro';

const meta = { title: 'Auth/Intro', component: Intro } satisfies Meta<typeof Intro>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
