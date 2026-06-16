import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import SelectionModal from './SelectionModal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCar, faBus } from '@fortawesome/free-solid-svg-icons';

const transportOptions = [
  {
    label: '자동차',
    icon: <FontAwesomeIcon icon={faCar} color="#1344FF" size={24} />,
  },
  {
    label: '대중교통',
    icon: <FontAwesomeIcon icon={faBus} color="#1344FF" size={24} />,
  },
];

const meta = {
  title: 'Components/Common/SelectionModal',
  component: SelectionModal,
  render: (args) => {
    const [visible, setVisible] = useState(true);
    const [value, setValue] = useState(args.currentValue);
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setVisible(true)}
          style={{ padding: 20, backgroundColor: '#1344FF', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>{args.title} 열기 ({value})</Text>
        </TouchableOpacity>
        <SelectionModal
          {...args}
          visible={visible}
          currentValue={value}
          onClose={() => setVisible(false)}
          onSelect={(option) => {
            console.log('Selected option:', option);
            setValue(option);
            setVisible(false);
          }}
        />
      </View>
    );
  },
  args: {
    visible: true,
    title: '이동수단 선택',
    options: transportOptions,
    currentValue: '자동차',
  },
} satisfies Meta<typeof SelectionModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PublicTransportSelected: Story = {
  args: {
    currentValue: '대중교통',
  },
};
