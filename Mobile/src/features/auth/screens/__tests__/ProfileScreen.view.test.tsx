import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import ProfileScreenView from '../ProfileScreen.view';
import { styles } from '../ProfileScreen.styles';

const mockSetQueryData = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: () => true,
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: jest.fn() }),
}));

jest.mock('../../../../components/common', () => ({
  LoadingSpinner: () => null,
  MenuModal: () => null,
  ShareModal: () => null,
  UpdatePasswordModal: () => null,
  UpdateThemeModal: () => null,
  UpdateValueModal: () => null,
}));

jest.mock('../../../../components/ui', () => ({ UnderlineTabs: () => null }));
jest.mock(
  '../../../itinerary/components/checklist/ChecklistSheet',
  () => () => null,
);
jest.mock('../../../itinerary/hooks/useChecklistQueries', () => ({
  useChecklist: () => ({ data: [] }),
}));
jest.mock('../../../../api/trips', () => ({
  PLAN_NAME_MAX_LENGTH: 30,
  deletePlans: jest.fn(),
  leaveAsEditor: jest.fn(),
}));
jest.mock('../../../../api/auth', () => ({
  verifyNicknameAvailable: jest.fn(),
}));
jest.mock('../../components/FeedbackModal', () => () => null);
jest.mock('../../../../components/common/FallbackImage', () => () => null);
jest.mock('../../components/ProfileActivitySections', () => ({
  ProfileCalendarSection: () => null,
  ProfileCommunitySection: () => null,
  ProfileFootprintSection: () => null,
  ProfileTravelLogSection: () => null,
}));

jest.mock('react-native-linear-gradient', () => () => null);
jest.mock('react-native-date-picker', () => () => null);

const BASE_PROPS = {
  loading: false,
  loadError: false,
  onRetryLoad: jest.fn(),
  user: {
    name: 'Mate',
    email: 'mate@example.com',
    profileImageUrl: '',
    profilePublic: false,
    birthdate: '',
    gender: '',
    preferredThemes: [],
    socialLogin: false,
    myPlans: [],
  },
  isThemeModalVisible: false,
  setThemeModalVisible: jest.fn(),
  isPasswordModalVisible: false,
  setPasswordModalVisible: jest.fn(),
  handleUpdateNickname: jest.fn(),
  handleUpdateBirthdate: jest.fn(),
  handleUpdateGender: jest.fn(),
  handleUpdateTheme: jest.fn(),
  handleUpdatePassword: jest.fn(),
  handleResign: jest.fn(),
  onRenamePlan: jest.fn(),
  onChangeProfileVisibility: jest.fn(),
  isProfileVisibilityUpdating: false,
  onChangeProfileImage: jest.fn(),
  onDeleteProfileImage: jest.fn(),
  isProfileImageUpdating: false,
};

function textOf(tree: renderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

describe('ProfileScreenView 탭', () => {
  it('그냥 열면 웹 차림표와 같이 프로필 탭이 켜진다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ProfileScreenView {...(BASE_PROPS as any)} />);
    });

    const body = textOf(tree!);
    expect(body).toContain('내가 좋아하는 여행');
    expect(body).not.toContain('여행 타임라인');
    act(() => tree!.unmount());
  });

  // 일정 화면에서 "일정 자리로 굴려 달라"며 넘어온 길은 여행 탭이 켜져 있어야
  // 굴릴 자리가 생긴다. 프로필 탭에서 열리면 아무 일도 일어나지 않는다.
  it('일정 자리로 굴리라고 넘어오면 여행 탭이 켜진다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ProfileScreenView {...(BASE_PROPS as any)} scrollToItinerary />,
      );
    });

    const body = textOf(tree!);
    expect(body).toContain('여행 타임라인');
    expect(body).not.toContain('내가 좋아하는 여행');
    act(() => tree!.unmount());
  });
});

describe('ProfileScreenView profile save', () => {
  it('submits profile changes only once for same-render presses', async () => {
    let resolveUpdate: (() => void) | undefined;
    const pendingUpdate = new Promise<void>(resolve => {
      resolveUpdate = resolve;
    });
    const handleUpdateNickname = jest.fn(() => pendingUpdate);

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ProfileScreenView
          loading={false}
          loadError={false}
          onRetryLoad={jest.fn()}
          user={{
            name: 'Mate',
            email: 'mate@example.com',
            profileImageUrl: '',
            profilePublic: false,
            birthdate: '',
            gender: '',
            preferredThemes: [],
            socialLogin: false,
            myPlans: [],
          }}
          isThemeModalVisible={false}
          setThemeModalVisible={jest.fn()}
          isPasswordModalVisible={false}
          setPasswordModalVisible={jest.fn()}
          handleUpdateNickname={handleUpdateNickname}
          handleUpdateBirthdate={jest.fn()}
          handleUpdateGender={jest.fn()}
          handleUpdateTheme={jest.fn()}
          handleUpdatePassword={jest.fn()}
          handleResign={jest.fn()}
          onRenamePlan={jest.fn()}
          onChangeProfileVisibility={jest.fn()}
          isProfileVisibilityUpdating={false}
          onChangeProfileImage={jest.fn()}
          onDeleteProfileImage={jest.fn()}
          isProfileImageUpdating={false}
        />,
      );
    });

    const editButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.style === styles.editButton)!;
    act(() => editButton.props.onPress());
    const nicknameInput = tree!.root
      .findAllByType(TextInput)
      .find(node => node.props.maxLength !== undefined)!;
    act(() => nicknameInput.props.onChangeText('Trip'));
    const saveButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.style === styles.saveButton)!;

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = saveButton.props.onPress();
      second = saveButton.props.onPress();
    });

    await act(async () => {
      resolveUpdate?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(handleUpdateNickname).toHaveBeenCalledTimes(1);
  });
});
