import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import ProfileScreenView from '../ProfileScreen.view';
import { styles } from '../ProfileScreen.styles';
import PopupModal from '../../../../components/common/PopupModal';

const mockSetQueryData = jest.fn();
const mockShowAlert = jest.fn();

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
  useAlert: () => ({ showAlert: mockShowAlert }),
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
  onChangeProfileImage: jest.fn(),
  onDeleteProfileImage: jest.fn(),
  isProfileImageUpdating: false,
};

function textOf(tree: renderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

describe('ProfileScreenView 탭', () => {
  it('새 일정도 체크리스트 0/0과 소유 구분을 바로 표시한다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ProfileScreenView
          {...(BASE_PROPS as any)}
          scrollToItinerary
          user={{
            ...BASE_PROPS.user,
            myPlans: [
              {
                planId: 'mine',
                planName: '내 제주 여행',
                isShared: false,
                startDate: '2099.09.01',
                endDate: '2099.09.03',
              },
              {
                planId: 'invited',
                planName: '함께 부산 여행',
                isShared: true,
                startDate: '2099.10.01',
                endDate: '2099.10.03',
              },
            ],
          }}
        />,
      );
    });
    const body = textOf(tree!);
    expect(body).toContain('0/0');
    expect(body).not.toContain('확인하기');
    expect(body).toContain('나의 일정');
    expect(body).toContain('초대받은 일정');
    act(() => tree!.unmount());
  });

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
  it('asks before discarding edits but allows closing restored values', () => {
    mockShowAlert.mockClear();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ProfileScreenView {...(BASE_PROPS as any)} />);
    });
    act(() =>
      tree!.root
        .findAllByType(TouchableOpacity)
        .find(node => node.props.style === styles.editButton)!
        .props.onPress(),
    );
    const nickname = () =>
      tree!.root
        .findAllByType(TextInput)
        .find(node => node.props.maxLength !== undefined)!;
    const modal = () =>
      tree!.root.findAllByType(PopupModal).find(node => node.props.visible)!;
    act(() => nickname().props.onChangeText('Trip'));
    act(() => modal().props.onClose());
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: '변경사항 취소' }),
    );
    expect(modal()).toBeDefined();
    mockShowAlert.mockClear();
    act(() => nickname().props.onChangeText('Mate'));
    act(() => modal().props.onClose());
    expect(mockShowAlert).not.toHaveBeenCalled();
    expect(modal()).toBeUndefined();
    act(() => tree!.unmount());
  });

  it('keeps unsaved fields after a partial save and retries only those fields', async () => {
    mockShowAlert.mockClear();
    const handleUpdateNickname = jest.fn().mockResolvedValue(undefined);
    const handleUpdateGender = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined);
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ProfileScreenView
          {...(BASE_PROPS as any)}
          handleUpdateNickname={handleUpdateNickname}
          handleUpdateGender={handleUpdateGender}
        />,
      );
    });
    act(() =>
      tree!.root
        .findAllByType(TouchableOpacity)
        .find(node => node.props.style === styles.editButton)!
        .props.onPress(),
    );
    act(() =>
      tree!.root
        .findAllByType(TextInput)
        .find(node => node.props.maxLength !== undefined)!
        .props.onChangeText('Trip'),
    );
    act(() =>
      tree!.root
        .findAllByType(TouchableOpacity)
        .filter(node => node.props.accessibilityRole === 'radio')[1]
        .props.onPress(),
    );
    const save = () =>
      tree!.root
        .findAllByType(TouchableOpacity)
        .find(node => node.props.style === styles.saveButton)!
        .props.onPress();
    await act(async () => {
      await save();
    });
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일부 정보만 저장됐어요',
        message: expect.stringContaining('닉네임'),
      }),
    );
    await act(async () => {
      await save();
    });
    expect(handleUpdateNickname).toHaveBeenCalledTimes(1);
    expect(handleUpdateGender).toHaveBeenCalledTimes(2);
    act(() => tree!.unmount());
  });

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
