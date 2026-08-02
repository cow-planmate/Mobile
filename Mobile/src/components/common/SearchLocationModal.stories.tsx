import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchLocationModal from './SearchLocationModal';

// 여행지 목록 조회에 React Query를 쓰므로 스토리에도 Provider가 필요하다.
const storyQueryClient = new QueryClient();

const meta = {
  title: 'Components/Common/SearchLocationModal',
  component: SearchLocationModal,
  render: (args) => {
    const [visible, setVisible] = useState(true);
    return (
      <QueryClientProvider client={storyQueryClient}>
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
      </QueryClientProvider>
    );
  },
  args: {
    visible: true,
  },
} satisfies Meta<typeof SearchLocationModal>;

export default meta;

type Story = StoryObj<typeof SearchLocationModal>;

export const Default: Story = {};
