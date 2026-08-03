import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ProfileScreenView from './ProfileScreen.view';

const meta = {
  title: 'Screens/Auth/ProfileScreen',
  component: ProfileScreenView,
  render: (args) => {
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    const [user, setUser] = useState({
      email: 'hello@example.com',
      name: '홍길동',
      gender: '남자',
      birthdate: '1999-08-15',
      preferredThemes: ['관광지', '맛집', '카페', '힐링', '휴양'],
    });

    return (
      <ProfileScreenView
        {...args}
        user={user}
        isThemeModalVisible={themeModalVisible}
        setThemeModalVisible={setThemeModalVisible}
        isPasswordModalVisible={passwordModalVisible}
        setPasswordModalVisible={setPasswordModalVisible}
        handleUpdateNickname={async (name: string) => {
          setUser(prev => ({ ...prev, name }));
        }}
        handleUpdateBirthdate={async (birthdate: string) => {
          setUser(prev => ({ ...prev, birthdate }));
        }}
        handleUpdateGender={async (gender: string) => {
          setUser(prev => ({ ...prev, gender }));
        }}
        handleUpdateTheme={async () => {
          setThemeModalVisible(false);
        }}
        handleUpdatePassword={async () => {
          setPasswordModalVisible(false);
        }}
        handleResign={() => {}}
      />
    );
  },
  args: {
    loading: false,
  },
} satisfies Meta<typeof ProfileScreenView>;

export default meta;

type Story = StoryObj<typeof ProfileScreenView>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
