import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import { KAKAO_APP_KEY } from '@env';
import { RoutePoint } from '../../../api/route';
import { tokens } from '../../../theme/tokens';

/** WebView로 주입되는 SVG 문자열 안에서 쓰는 색 — JSX가 아니라 문자열이라 토큰을 직접 넣는다 */
const ROUTE_ARROW_COLOR = tokens.colors.primary;

export interface MapPlace {
  id: string;
  placeRefId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  place_url?: string;
}

export interface MapTransitLane {
  color: string;
  path: RoutePoint[];
}

interface KakaoMapViewProps {
  places: MapPlace[];

  routePath?: RoutePoint[];

  transitLanes?: MapTransitLane[];
  style?: object;
}

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

  const isLoadedRef = useRef(false);

  const validPlaces = useMemo(
    () => places.filter(p => p.latitude !== 0 && p.longitude !== 0),
    [places],
  );

  const pushMapState = useCallback(() => {
    if (!isLoadedRef.current || !webViewRef.current) {
      return;
    }

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
    const pathJson = toScriptSafeJson(routePath ?? []);
    const lanesJson = toScriptSafeJson(transitLanes ?? []);

    webViewRef.current.injectJavaScript(`
      if (window.__setPlaces) { window.__setPlaces(${placesJson}); }
      if (window.__setRoute) { window.__setRoute(${pathJson}); }
      if (window.__setLanes) { window.__setLanes(${lanesJson}); }
      true;
    `);
  }, [validPlaces, routePath, transitLanes]);

  useEffect(() => {
    pushMapState();
  }, [pushMapState]);

  const handleLoadStart = useCallback(() => {
    isLoadedRef.current = false;
  }, []);

  const handleLoadEnd = useCallback(() => {
    isLoadedRef.current = true;
    pushMapState();
  }, [pushMapState]);

  const html = useMemo(() => {
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
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .marker-tail {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #1344FF;
      margin-top: -1px;
    }

    .info-card {
      padding: 10px 14px;
      min-width: 160px;
      max-width: 220px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
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
    var __pending = { places: null, route: null, lanes: null };
    window.__setPlaces = function(places) { __pending.places = places; };
    window.__setRoute = function(path) { __pending.route = path; };
    window.__setLanes = function(lanes) { __pending.lanes = lanes; };
  </script>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false"></script>
  <script>
    kakao.maps.load(function() {
      var container = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(36.5, 127.8),
        level: 13
      };
      var map = new kakao.maps.Map(container, options);

      var markerOverlays = [];
      var clickMarkers = [];
      var infoWindows = [];
      var openInfowindow = null;
      var straightOverlays = [];

      var roadPolyline = null;
      var lanePolylines = [];

      function showStraight(visible) {
        straightOverlays.forEach(function(overlay) {
          overlay.setMap(visible ? map : null);
        });
      }

      function clearPlaceOverlays() {
        markerOverlays.forEach(function(o) { o.setMap(null); });
        markerOverlays = [];
        clickMarkers.forEach(function(m) { m.setMap(null); });
        clickMarkers = [];
        infoWindows.forEach(function(iw) { iw.close(); });
        infoWindows = [];
        straightOverlays.forEach(function(o) { o.setMap(null); });
        straightOverlays = [];
        if (openInfowindow) {
          openInfowindow.close();
          openInfowindow = null;
        }
      }

      window.__setPlaces = function(places) {
        clearPlaceOverlays();
        places = places || [];

        if (places.length === 0) {
          document.getElementById('map').innerHTML = '<div class="empty-msg">표시할 장소가 없어요</div>';
          return;
        }

        var bounds = new kakao.maps.LatLngBounds();
        var linePath = [];

        places.forEach(function(place) {
          var position = new kakao.maps.LatLng(place.lat, place.lng);
          bounds.extend(position);
          linePath.push(position);

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
          markerOverlays.push(customOverlay);

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
          infoWindows.push(infowindow);

          var marker = new kakao.maps.Marker({
            position: position,
            map: map,
            opacity: 0
          });
          clickMarkers.push(marker);

          kakao.maps.event.addListener(marker, 'click', function() {
            if (openInfowindow) openInfowindow.close();
            infowindow.open(map, marker);
            openInfowindow = infowindow;
          });
        });

        if (linePath.length > 1) {
          var polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 3,
            strokeColor: "${ROUTE_ARROW_COLOR}",
            strokeOpacity: 0.35,
            strokeStyle: 'dash'
          });
          polyline.setMap(map);
          straightOverlays.push(polyline);

          for (var i = 0; i < places.length - 1; i++) {
            var p1 = places[i];
            var p2 = places[i + 1];

            var midLat = (p1.lat + p2.lat) / 2;
            var midLng = (p1.lng + p2.lng) / 2;
            var midPosition = new kakao.maps.LatLng(midLat, midLng);

            var dy = p1.lat - p2.lat;
            var dx = p2.lng - p1.lng;
            var angle = Math.atan2(dy, dx) * 180 / Math.PI;

            var arrowContent =
              '<div style="transform: rotate(' + angle + 'deg); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">' +
                '<svg width="22" height="22" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M3 2L7 5L3 8" stroke="${ROUTE_ARROW_COLOR}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.8"/>' +
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
        showStraight(!roadPolyline);

        if (places.length > 1) {
          map.setBounds(bounds);
        } else {
          map.setCenter(new kakao.maps.LatLng(places[0].lat, places[0].lng));
          map.setLevel(3);
        }
      };

      window.__setRoute = function(path) {
        if (roadPolyline) {
          roadPolyline.setMap(null);
          roadPolyline = null;
        }

        if (!path || path.length < 2) {
          showStraight(true);
          return;
        }

        roadPolyline = new kakao.maps.Polyline({
          path: path.map(function(p) {
            return new kakao.maps.LatLng(p.lat, p.lng);
          }),
          strokeWeight: 4,
          strokeColor: "${ROUTE_ARROW_COLOR}",
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

      if (__pending.places) window.__setPlaces(__pending.places);
      if (__pending.route) window.__setRoute(__pending.route);
      if (__pending.lanes) window.__setLanes(__pending.lanes);
      __pending = { places: null, route: null, lanes: null };
    });
  </script>
</body>
</html>`;

  }, []);

  if (!hasKakaoAppKey) {
    return (
      <View style={[mapStyles.container, style]}>
        <View style={mapStyles.emptyContainer}>
          <MapPin size={32} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={mapStyles.emptyText}>지도를 불러올 수 없어요</Text>
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
          <Text style={mapStyles.emptyText}>표시할 장소가 없어요</Text>
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
    backgroundColor: tokens.colors.surface,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: tokens.colors.textTertiary,
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
