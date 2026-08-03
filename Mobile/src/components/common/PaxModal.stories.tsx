import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import PaxModal from './PaxModal';

const meta = {
  title: 'Components/Common/PaxModal',
  component: PaxModal,
  render: (args) => {
    const [visible, setVisible] = useState(true);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setVisible(true)}
          style={{ padding: 20, backgroundColor: '#1344FF', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>인원 선택 열기</Text>
        </TouchableOpacity>
        <PaxModal
          {...args}
          visible={visible}
          onClose={() => setVisible(false)}
          onConfirm={(pax) => {
            console.log('Confirmed pax:', pax);
            setVisible(false);
          }}
        />
      </View>
    );
  },
  args: {
    visible: true,
    initialAdults: 2,
    initialChildren: 1,
  },
} satisfies Meta<typeof PaxModal>;

export default meta;

type Story = StoryObj<typeof PaxModal>;

export const Default: Story = {};

export const SingleAdult: Story = {
  args: {
    initialAdults: 1,
    initialChildren: 0,
  },
};
