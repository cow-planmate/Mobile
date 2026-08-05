import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import SelectionModal, { OptionType } from './SelectionModal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCar, faBus } from '@fortawesome/free-solid-svg-icons';

/**
 * args에는 아이콘 키만 둔다.
 *
 * 예전에는 여기에 <FontAwesomeIcon .../> 엘리먼트를 직접 담았는데, React 엘리먼트는
 * 순환 참조를 가지고 있어 on-device Storybook이 args를 직렬화하려 할 때마다 "cycle
 * in arg" 경고를 무한히 찍어냈다. 이 경고가 스토리 하나에서만 나는 게 아니라 전체
 * 스토리 인덱스를 만드는 과정에서 반복돼, Storybook 자체가 어떤 화면에서도 뜨지
 * 않는 상태였다. 아이콘은 렌더 시점에 키로 조립한다.
 */
type TransportIconKey = 'car' | 'bus';

const TRANSPORT_ICONS: Record<TransportIconKey, React.ReactNode> = {
  car: <FontAwesomeIcon icon={faCar} color="#1344FF" size={24} />,
  bus: <FontAwesomeIcon icon={faBus} color="#1344FF" size={24} />,
};

const transportOptionConfigs: { label: string; iconKey: TransportIconKey }[] = [
  { label: '자동차', iconKey: 'car' },
  { label: '대중교통', iconKey: 'bus' },
];

const meta = {
  title: 'Components/Common/SelectionModal',
  component: SelectionModal,
  render: (args) => {
    const [visible, setVisible] = useState(true);
    const [value, setValue] = useState(args.currentValue);

    const options: OptionType[] = transportOptionConfigs.map(config => ({
      label: config.label,
      icon: TRANSPORT_ICONS[config.iconKey],
    }));

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
          options={options}
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
    options: [],
    currentValue: '자동차',
  },
} satisfies Meta<typeof SelectionModal>;

export default meta;

type Story = StoryObj<typeof SelectionModal>;

export const Default: Story = {};

export const PublicTransportSelected: Story = {
  args: {
    currentValue: '대중교통',
  },
};
