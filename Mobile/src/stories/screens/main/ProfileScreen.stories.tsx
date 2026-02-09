import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ProfileScreenView } from '../../../screens/app/main/ProfileScreen.view';

const meta = {
  title: 'Screens/Main/ProfileScreen',
  component: ProfileScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    loading: false,
    user: {
      name: '디자인테스트',
      email: 'test@example.com',
      age: '25',
      gender: 'MALE',
      preferredTheme: 'LIGHT',
    },
    isNicknameModalVisible: false,
    setNicknameModalVisible: visible =>
      console.log(`Set nickname modal: ${visible}`),
    isAgeModalVisible: false,
    setAgeModalVisible: visible => console.log(`Set age modal: ${visible}`),
    isGenderModalVisible: false,
    setGenderModalVisible: visible =>
      console.log(`Set gender modal: ${visible}`),
    isThemeModalVisible: false,
    setThemeModalVisible: visible => console.log(`Set theme modal: ${visible}`),
    isPasswordModalVisible: false,
    setPasswordModalVisible: visible =>
      console.log(`Set password modal: ${visible}`),
    handleUpdateNickname: async val => console.log(`Update nickname: ${val}`),
    handleUpdateAge: async val => console.log(`Update age: ${val}`),
    handleUpdateGender: async val => console.log(`Update gender: ${val}`),
    handleUpdateTheme: async () => console.log('Update theme'),
    handleUpdatePassword: async (current, newPass) =>
      console.log('Update password'),
    handleResign: () => console.log('Resign'),
    logout: async () => console.log('Logout'),
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
