import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin } from 'lucide-react-native';
import { KAKAO_APP_KEY } from '@env';
import { RoutePoint } from '../../../api/route';

export interface MapPlace {
  id: string;
  placeRefId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  place_url?: string;
}

/** 지도에 겹쳐 그릴 대중교통 노선 한 구간 */
export interface MapTransitLane {
  color: string;
  path: RoutePoint[];
}

interface KakaoMapViewProps {
  places: MapPlace[];
  /**
   * 도로를 따라가는 실제 경로 좌표.
   * 비어 있으면 장소를 잇는 직선(점선 + 화살표)으로 대체된다.
   */
  routePath?: RoutePoint[];
  /** 선택한 대중교통 경로의 노선별 폴리라인 */
  transitLanes?: MapTransitLane[];
  style?: object;
}

/**
 * <script> 안에 안전하게 넣을 수 있는 JSON 문자열을 만든다.
 *
 * 장소 이름 같은 서버 문자열에 '</script>'가 들어 있으면 스크립트 태그가 그
 * 자리에서 닫혀 지도가 통째로 깨진다. U+2028/2029도 파서에 따라 문제가 된다.
 */
/**
 * 카카오 지도 앱 키 존재 여부.
 *
 * .env에 KAKAO_APP_KEY가 없으면 @env가 undefined를 주고, 그대로 SDK URL에
 * 끼워 넣으면 appkey=undefined로 요청돼 지도가 뜨지 않는다.
 */
const hasKakaoAppKey = !!(KAKAO_APP_KEY ?? '').trim();

const toScriptSafeJson = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

export default function KakaoMapView({
  places,
  routePath,
  transitLanes,
  style,
}: KakaoMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  /**
   * WebView 문서가 로드되기 전에 injectJavaScript를 부르면 아무 일도 일어나지
   * 않는다. 장소가 바뀌어 HTML이 재생성되면 문서도 다시 로드되므로, 로드 완료
   * 시점을 추적했다가 그때 최신 경로를 다시 밀어 넣는다.
   */
  const isLoadedRef = useRef(false);

  const validPlaces = useMemo(
    () => places.filter(p => p.latitude !== 0 && p.longitude !== 0),
    [places],
  );

  /**
   * 지도에 경로/노선을 반영한다.
   *
   * 장소가 바뀔 때만 HTML을 다시 만들고, 경로는 이 함수로 밀어 넣는다.
   * HTML을 다시 만들면 WebView가 통째로 리로드되어 지도가 깜빡이기 때문이다.
   */
  const pushOverlays = useCallback(() => {
    if (!isLoadedRef.current || !webViewRef.current) {
      return;
    }

    const pathJson = toScriptSafeJson(routePath ?? []);
    const lanesJson = toScriptSafeJson(transitLanes ?? []);

    webViewRef.current.injectJavaScript(`
      if (window.__setRoute) { window.__setRoute(${pathJson}); }
      if (window.__setLanes) { window.__setLanes(${lanesJson}); }
      true;
    `);
  }, [routePath, transitLanes]);

  useEffect(() => {
    pushOverlays();
  }, [pushOverlays]);

  const handleLoadStart = useCallback(() => {
    isLoadedRef.current = false;
  }, []);

  const handleLoadEnd = useCallback(() => {
    isLoadedRef.current = true;
    pushOverlays();
  }, [pushOverlays]);

  const html = useMemo(() => {
    const placesJson = toScriptSafeJson(
      validPlaces.map((p, idx) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        lat: p.latitude,
        lng: p.longitude,
        placeUrl: p.place_url || '',
        order: idx + 1,
      })),
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }

    /* ── Marker: pill with number + pin tail ── */
    .marker-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18));
    }
    .marker-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 7px;
      background: #1344FF;
      color: #fff;
      border-radius: 13px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.2px;
      border: 2px solid #fff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .marker-tail {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #1344FF;
      margin-top: -1px;
    }

    /* ── Info Window ── */
    .info-card {
      padding: 10px 14px;
      min-width: 160px;
      max-width: 220px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      border-radius: 10px;
      background: #fff;
    }
    .info-card .place-name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-card .place-addr {
      font-size: 11px;
      color: #9CA3AF;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-card .place-footer {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-card .order-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: #E8EDFF;
      color: #1344FF;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .info-card .place-link {
      font-size: 12px;
      color: #1344FF;
      text-decoration: none;
      font-weight: 500;
    }

    .empty-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: #9CA3AF;
      font-size: 15px;
      background: #F9FAFB;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // 지도가 준비되기 전에 RN이 경로를 밀어 넣을 수 있다. 그때는 값만 쥐고
    // 있다가 지도 생성 직후 흘려보낸다.
    var __pending = { route: null, lanes: null };
    window.__setRoute = function(path) { __pending.route = path; };
    window.__setLanes = function(lanes) { __pending.lanes = lanes; };
  </script>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false"></script>
  <script>
    var places = ${placesJson};

    if (places.length === 0) {
      document.getElementById('map').innerHTML = '<div class="empty-msg">표시할 장소가 없습니다</div>';
    } else {
      kakao.maps.load(function() {
        var container = document.getElementById('map');
        var options = {
          center: new kakao.maps.LatLng(places[0].lat, places[0].lng),
          level: 5
        };
        var map = new kakao.maps.Map(container, options);

        var bounds = new kakao.maps.LatLngBounds();
        var linePath = [];
        var openInfowindow = null;

        places.forEach(function(place) {
          var position = new kakao.maps.LatLng(place.lat, place.lng);
          bounds.extend(position);
          linePath.push(position);

          // 커스텀 마커 (pill + tail)
          var markerContent =
            '<div class="marker-wrap">' +
              '<div class="marker-pill">' + place.order + '</div>' +
              '<div class="marker-tail"></div>' +
            '</div>';
          var customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: markerContent,
            yAnchor: 2.2
          });
          customOverlay.setMap(map);

          // 인포윈도우
          var infoContent =
            '<div class="info-card">' +
              '<div class="place-name">' + place.name + '</div>' +
              '<div class="place-addr">' + (place.address || '') + '</div>' +
              '<div class="place-footer">' +
                '<span class="order-badge">' + place.order + '</span>' +
                (place.placeUrl
                  ? '<a class="place-link" href="' + place.placeUrl + '" target="_blank">장소 정보 →</a>'
                  : '') +
              '</div>' +
            '</div>';

          var infowindow = new kakao.maps.InfoWindow({
            content: infoContent,
            removable: true
          });

          // 투명 마커 (클릭 이벤트용)
          var marker = new kakao.maps.Marker({
            position: position,
            map: map,
            opacity: 0
          });

          kakao.maps.event.addListener(marker, 'click', function() {
            if (openInfowindow) openInfowindow.close();
            infowindow.open(map, marker);
            openInfowindow = infowindow;
          });
        });

        // ── 직선 폴백 (도로 경로가 없을 때만 보인다) ──
        var straightOverlays = [];

        if (linePath.length > 1) {
          var polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 3,
            strokeColor: '#1344FF',
            strokeOpacity: 0.35,
            strokeStyle: 'dash'
          });
          polyline.setMap(map);
          straightOverlays.push(polyline);

          // 점선 가운데 화살표 추가
          for (var i = 0; i < places.length - 1; i++) {
            var p1 = places[i];
            var p2 = places[i + 1];

            var midLat = (p1.lat + p2.lat) / 2;
            var midLng = (p1.lng + p2.lng) / 2;
            var midPosition = new kakao.maps.LatLng(midLat, midLng);

            // 각도 계산 (화면 좌표계를 기준으로 시계방향 회전각도 산출)
            var dy = p1.lat - p2.lat;
            var dx = p2.lng - p1.lng;
            var angle = Math.atan2(dy, dx) * 180 / Math.PI;

            var arrowContent =
              '<div style="transform: rotate(' + angle + 'deg); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">' +
                '<svg width="22" height="22" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M3 2L7 5L3 8" stroke="#1344FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.8"/>' +
                '</svg>' +
              '</div>';

            var arrowOverlay = new kakao.maps.CustomOverlay({
              position: midPosition,
              content: arrowContent,
              xAnchor: 0.5,
              yAnchor: 0.5
            });
            arrowOverlay.setMap(map);
            straightOverlays.push(arrowOverlay);
          }
        }

        // ── RN에서 밀어 넣는 경로 레이어 ──
        var roadPolyline = null;
        var lanePolylines = [];

        function showStraight(visible) {
          straightOverlays.forEach(function(overlay) {
            overlay.setMap(visible ? map : null);
          });
        }

        window.__setRoute = function(path) {
          if (roadPolyline) {
            roadPolyline.setMap(null);
            roadPolyline = null;
          }

          if (!path || path.length < 2) {
            // 도로 경로가 없으면 직선 폴백으로 되돌린다
            showStraight(true);
            return;
          }

          roadPolyline = new kakao.maps.Polyline({
            path: path.map(function(p) {
              return new kakao.maps.LatLng(p.lat, p.lng);
            }),
            strokeWeight: 4,
            strokeColor: '#1344FF',
            strokeOpacity: 0.6,
            strokeStyle: 'solid'
          });
          roadPolyline.setMap(map);
          showStraight(false);
        };

        window.__setLanes = function(lanes) {
          lanePolylines.forEach(function(line) { line.setMap(null); });
          lanePolylines = [];

          if (!lanes || lanes.length === 0) {
            return;
          }

          lanes.forEach(function(lane) {
            if (!lane.path || lane.path.length < 2) return;
            var line = new kakao.maps.Polyline({
              path: lane.path.map(function(p) {
                return new kakao.maps.LatLng(p.lat, p.lng);
              }),
              strokeWeight: 5,
              strokeColor: lane.color,
              strokeOpacity: 0.85,
              strokeStyle: 'solid'
            });
            line.setMap(map);
            lanePolylines.push(line);
          });
        };

        // 영역 조절
        if (places.length > 1) {
          map.setBounds(bounds);
        } else {
          map.setCenter(new kakao.maps.LatLng(places[0].lat, places[0].lng));
          map.setLevel(3);
        }

        // 지도 준비 전에 도착한 경로를 반영
        if (__pending.route) window.__setRoute(__pending.route);
        if (__pending.lanes) window.__setLanes(__pending.lanes);
        __pending = { route: null, lanes: null };
      });
    }
  </script>
</body>
</html>`;
  }, [validPlaces]);

  /**
   * 키가 없으면 SDK 스크립트가 appkey=undefined로 실려 조용히 실패한다.
   * 빈 WebView만 남아 앱이 깨진 것처럼 보이므로 원인을 밝혀 준다.
   */
  if (!hasKakaoAppKey) {
    return (
      <View style={[mapStyles.container, style]}>
        <View style={mapStyles.emptyContainer}>
          <MapPin size={32} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={mapStyles.emptyText}>지도를 불러올 수 없습니다</Text>
          <Text style={mapStyles.emptyHint}>
            카카오 지도 키가 설정되지 않았어요.
          </Text>
        </View>
      </View>
    );
  }

  if (validPlaces.length === 0) {
    return (
      <View style={[mapStyles.container, style]}>
        <View style={mapStyles.emptyContainer}>
          <MapPin size={32} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={mapStyles.emptyText}>표시할 장소가 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[mapStyles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={mapStyles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Pretendard-Medium',
  },
  emptyHint: {
    fontSize: 12,
    color: '#B0B6BF',
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
