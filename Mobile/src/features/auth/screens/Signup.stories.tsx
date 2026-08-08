import React, { useState } from 'react';
import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import Signup from './Signup';

const meta = { title: 'Auth/Signup', component: Signup } satisfies Meta<typeof Signup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [submitted, setSubmitted] = useState(false);
    return (
      <>
        <Signup onSubmit={() => setSubmitted(true)} />
        {submitted && <Text>Submitted</Text>}
      </>
    );
  },
};

export const Filled: Story = {
  args: {
    initialName: 'Traveler',
    initialEmail: 'traveler@example.com',
    initialPassword: 'password123',
    initialAgreed: true,
  },
};
