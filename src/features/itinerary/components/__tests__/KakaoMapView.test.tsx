import React from 'react';
import renderer, { act } from 'react-test-renderer';
import KakaoMapView from '../KakaoMapView';

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const MockWebView = require('react').forwardRef((props: any, _ref: any) => (
    <View {...props} />
  ));
  return { __esModule: true, default: MockWebView, WebView: MockWebView };
});

/** 지도 HTML의 첫 스크립트(도우미 함수 정의)를 가짜 window에서 실행해 꺼낸다. */
const loadHelpers = () => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    // 장소가 하나도 없으면 지도 대신 빈 안내만 그린다.
    tree = renderer.create(
      <KakaoMapView
        places={[{ id: '1', name: '장소', latitude: 37.5, longitude: 127 } as any]}
      />,
    );
  });
  const webView = tree!.root.findAll(node => !!node.props.source?.html)[0];
  const html: string = webView.props.source.html;
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
  const win: any = {};
  // eslint-disable-next-line no-new-func
  new Function('window', script)(win);
  act(() => tree!.unmount());
  return win;
};

describe('지도 정보 창에 넣는 글', () => {
  it('장소 이름에 섞인 태그를 글자로 바꾼다', () => {
    const { __escapeHtml } = loadHelpers();
    expect(__escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;',
    );
    expect(__escapeHtml(`"'&`)).toBe('&quot;&#39;&amp;');
    expect(__escapeHtml(undefined)).toBe('');
  });

  it('장소 링크는 http(s)만 남긴다', () => {
    const { __safeUrl } = loadHelpers();
    expect(__safeUrl('https://place.map.kakao.com/1')).toBe(
      'https://place.map.kakao.com/1',
    );
    expect(__safeUrl('javascript:alert(1)')).toBe('');
    expect(__safeUrl(' JavaScript:alert(1)')).toBe('');
    expect(__safeUrl('')).toBe('');
  });
});
