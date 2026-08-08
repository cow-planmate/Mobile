import React, { useState } from 'react';
import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import Login from './Login';

const meta = { title: 'Auth/Login', component: Login } satisfies Meta<typeof Login>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [submitted, setSubmitted] = useState(false);
    return (
      <>
        <Login onSubmit={() => setSubmitted(true)} />
        {submitted && <Text>Submitted</Text>}
      </>
    );
  },
};

export const Filled: Story = {
  args: { initialEmail: 'traveler@example.com', initialPassword: 'password123' },
};
