import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import CalendarModal from './CalendarModal';

const meta = {
  title: 'Components/Common/CalendarModal',
  component: CalendarModal,
  render: (args) => {
    const [visible, setVisible] = useState(true);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setVisible(true)}
          style={{ padding: 20, backgroundColor: '#1344FF', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>달력 열기</Text>
        </TouchableOpacity>
        <CalendarModal
          {...args}
          visible={visible}
          onClose={() => setVisible(false)}
          onConfirm={(dates) => {
            console.log('Confirmed dates:', dates);
            setVisible(false);
          }}
        />
      </View>
    );
  },
  args: {
    visible: true,
    initialStartDate: new Date(),
    initialEndDate: new Date(Date.now() + 86400000 * 3),
  },
} satisfies Meta<typeof CalendarModal>;

export default meta;

type Story = StoryObj<typeof CalendarModal>;

export const Default: Story = {};

export const NoInitialDates: Story = {
  args: {
    initialStartDate: undefined,
    initialEndDate: undefined,
  },
};
