import React from 'react';
import renderer, { act } from 'react-test-renderer';
import TravelFeedList from '../TravelFeedList';

// Mock @shopify/flash-list to avoid native dependency issues in jest
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

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Heart: () => <View testID="mock-icon-heart" />,
    MessageSquare: () => <View testID="mock-icon-message" />,
    MapPin: () => <View testID="mock-icon-mappin" />,
  };
});

// Mock theme and normalize
jest.mock('../../../../theme/theme', () => ({
  theme: {
    colors: {
      primary: '#000',
      background: '#fff',
      white: '#fff',
      surface: '#eee',
      borderLight: '#ddd',
      border: '#ccc',
      text: '#111',
      textSecondary: '#666',
      textTertiary: '#999',
      textLabel: '#444',
      sub: '#fafafa',
    },
  },
}));

jest.mock('../../../../utils/normalize', () => ({
  normalize: (size: number) => size,
}));

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
      component = renderer.create(<TravelFeedList />);
    });

    // Run timers to resolve the mock api setTimeout delay
    await act(async () => {
      jest.runAllTimers();
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
    
    // Check if container structure exists
    expect(JSON.stringify(tree)).toContain('mock-flash-list');
  });
});
