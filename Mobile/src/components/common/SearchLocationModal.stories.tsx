import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import SearchLocationModal from './SearchLocationModal';

const meta = {
  title: 'Components/Common/SearchLocationModal',
  component: SearchLocationModal,
  render: (args) => {
    const [visible, setVisible] = useState(true);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setVisible(true)}
          style={{ padding: 20, backgroundColor: '#1344FF', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>장소 검색 열기</Text>
        </TouchableOpacity>
        <SearchLocationModal
          {...args}
          visible={visible}
          onClose={() => setVisible(false)}
          onSelect={(location, id) => {
            console.log('Selected location:', location, id);
            setVisible(false);
          }}
        />
      </View>
    );
  },
  args: {
    visible: true,
    fieldToUpdate: 'destination',
  },
} satisfies Meta<typeof SearchLocationModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Destination: Story = {};

export const Departure: Story = {
  args: {
    fieldToUpdate: 'departure',
  },
};
