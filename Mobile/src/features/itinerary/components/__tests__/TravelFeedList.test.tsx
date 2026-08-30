import React from 'react';
import renderer, { act } from 'react-test-renderer';
import TravelFeedList from '../TravelFeedList';

jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: (props: any) => {
      const { data, renderItem, ListHeaderComponent, ListFooterComponent, ListEmptyComponent } = props;
      return (
        <View testID="mock-flash-list">
          {ListHeaderComponent && ListHeaderComponent()}
          {data && data.length > 0
            ? data.map((item: any, index: number) => {
                const element = renderItem({ item, index });
                return require('react').cloneElement(element, { key: item.id || index.toString() });
              })
            : ListEmptyComponent && (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent)}
          {ListFooterComponent && ListFooterComponent()}
        </View>
      );
    },
  };
});

jest.mock('lucide-react-native/dist/esm/icons/thumbs-up', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement(require('react-native').View, {
      testID: 'mock-icon-thumbsup',
    }),
}));
jest.mock('lucide-react-native/dist/esm/icons/thumbs-down', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement(require('react-native').View, {
      testID: 'mock-icon-thumbsdown',
    }),
}));
jest.mock('lucide-react-native/dist/esm/icons/message-square', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement(require('react-native').View, {
      testID: 'mock-icon-message',
    }),
}));
jest.mock('lucide-react-native/dist/esm/icons/eye', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement(require('react-native').View, {
      testID: 'mock-icon-eye',
    }),
}));
jest.mock('lucide-react-native/dist/esm/icons/copy', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement(require('react-native').View, {
      testID: 'mock-icon-copy',
    }),
}));
jest.mock('lucide-react-native/dist/esm/icons/clock', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement(require('react-native').View, {
      testID: 'mock-icon-clock',
    }),
}));

jest.mock('../../../../utils/normalize', () => ({
  normalize: (size: number) => size,
}));

const mockItem = {
  id: '1',
  title: '제주 3박4일',
  description: '가족과 함께한 여행',
  author: '민영',
  authorAvatar: '',
  authorLevel: 2,
  thumbnailUrl: 'https://example.com/thumb.jpg',
  createdAt: '2026.08.01',
  likes: 3,
  dislikes: 0,
  comments: 1,
  views: 10,
  forks: 0,
  tags: ['#뚜벅이최적화'],
  location: '제주',
  duration: '3박4일',
  routePlaces: ['공항', '성산일출봉', '섭지코지', '광치기해변', '숙소'],
  placeCount: 7,
};

describe('TravelFeedList Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly and loads mock data after timer', async () => {
    let component: any;

    await act(async () => {
      component = renderer.create(<TravelFeedList items={[]} />);
    });

    await act(async () => {
      jest.runAllTimers();
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    expect(JSON.stringify(tree)).toContain('mock-flash-list');
  });

  it('renders a populated list card', async () => {
    let component: any;

    await act(async () => {
      component = renderer.create(
        <TravelFeedList items={[mockItem]} viewMode="list" />,
      );
    });

    const tree = JSON.stringify(component.toJSON());
    expect(tree).toContain(mockItem.title);
    expect(tree).toContain(mockItem.author);
    // 코스 미리보기는 네 곳까지 보여주고 나머지는 접는다.
    expect(tree).toContain('DAY 1');
    expect(tree).toContain('성산일출봉');
    expect(tree).toContain('외 3곳');
    expect(tree).not.toContain('숙소');
  });

  it('코스 정보가 없으면 코스 줄을 그리지 않는다', async () => {
    let component: any;

    await act(async () => {
      component = renderer.create(
        <TravelFeedList
          items={[{ ...mockItem, routePlaces: [], placeCount: 0 }]}
          viewMode="list"
        />,
      );
    });

    const tree = JSON.stringify(component.toJSON());
    expect(tree).toContain(mockItem.title);
    expect(tree).not.toContain('DAY 1');
  });

  it('renders a populated grid card with an author avatar fallback', async () => {
    let component: any;

    await act(async () => {
      component = renderer.create(
        <TravelFeedList items={[mockItem]} viewMode="grid" />,
      );
    });

    const tree = JSON.stringify(component.toJSON());
    expect(tree).toContain(mockItem.title);
    expect(tree).toContain(mockItem.author.charAt(0));
  });
});
