import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ProfileScreenView from './ProfileScreen.view';

const meta = {
  title: 'Screens/Auth/ProfileScreen',
  component: ProfileScreenView,
  render: (args) => {
    const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
    const [ageModalVisible, setAgeModalVisible] = useState(false);
    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    const [user, setUser] = useState({
      email: 'hello@example.com',
      name: '홍길동',
      gender: 'MALE',
      age: 26,
      preferredThemes: ['관광지', '맛집', '카페', '힐링', '휴양'],
    });

    return (
      <ProfileScreenView
        {...args}
        user={user}
        isNicknameModalVisible={nicknameModalVisible}
        setNicknameModalVisible={setNicknameModalVisible}
        isAgeModalVisible={ageModalVisible}
        setAgeModalVisible={setAgeModalVisible}
        isGenderModalVisible={genderModalVisible}
        setGenderModalVisible={setGenderModalVisible}
        isThemeModalVisible={themeModalVisible}
        setThemeModalVisible={setThemeModalVisible}
        isPasswordModalVisible={passwordModalVisible}
        setPasswordModalVisible={setPasswordModalVisible}
        handleUpdateNickname={(name) => {
          console.log('Update nickname to:', name);
          setUser(prev => ({ ...prev, name }));
          setNicknameModalVisible(false);
        }}
        handleUpdateAge={(ageStr) => {
          const age = parseInt(ageStr, 10) || 0;
          console.log('Update age to:', age);
          setUser(prev => ({ ...prev, age }));
          setAgeModalVisible(false);
        }}
        handleUpdateGender={(gender) => {
          console.log('Update gender to:', gender);
          setUser(prev => ({ ...prev, gender }));
          setGenderModalVisible(false);
        }}
        handleUpdateTheme={() => {
          console.log('Update preferred themes');
          setThemeModalVisible(false);
        }}
        handleUpdatePassword={(cur, next) => {
          console.log('Update password from', cur, 'to', next);
          setPasswordModalVisible(false);
        }}
        handleResign={() => {
          console.log('User resigned');
        }}
        logout={() => {
          console.log('User logged out');
        }}
      />
    );
  },
  args: {
    loading: false,
  },
} satisfies Meta<typeof ProfileScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
