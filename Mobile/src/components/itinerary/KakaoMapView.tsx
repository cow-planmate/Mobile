import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export interface MapPlace {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  place_url?: string;
}

interface KakaoMapViewProps {
  places: MapPlace[];
  style?: object;
}

const KAKAO_APP_KEY = '30ab34e9ea2ce39848e8aab28a16cdbd';

export default function KakaoMapView({ places, style }: KakaoMapViewProps) {
  const validPlaces = useMemo(
    () => places.filter(p => p.latitude !== 0 && p.longitude !== 0),
    [places],
  );

  const html = useMemo(() => {
    const placesJson = JSON.stringify(
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
    .marker-label {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #1344FF;
      color: #fff;
      border-radius: 50%;
      font-size: 14px;
      font-weight: 700;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .info-window {
      padding: 8px 12px;
      min-width: 140px;
      max-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .info-window .place-name {
      font-size: 14px;
      font-weight: 600;
      color: #1C1C1E;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-window .place-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-window .order-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: 1.5px solid #1344FF;
      color: #1344FF;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .info-window .place-link {
      font-size: 12px;
      color: #1344FF;
      text-decoration: none;
    }
    .empty-msg {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: #8E8E93;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
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

        places.forEach(function(place) {
          var position = new kakao.maps.LatLng(place.lat, place.lng);
          bounds.extend(position);
          linePath.push(position);

          // 커스텀 오버레이 마커 (번호 표시)
          var markerContent = '<div class="marker-label">' + place.order + '</div>';
          var customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: markerContent,
            yAnchor: 1.2
          });
          customOverlay.setMap(map);

          // 인포윈도우 내용
          var infoContent = '<div class="info-window">' +
            '<div class="place-name">' + place.name + '</div>' +
            '<div class="place-info">' +
              '<span class="order-badge">' + place.order + '</span>' +
              (place.placeUrl ? '<a class="place-link" href="' + place.placeUrl + '" target="_blank">장소 정보 보기</a>' : '') +
            '</div>' +
          '</div>';

          var infowindow = new kakao.maps.InfoWindow({
            content: infoContent,
            removable: true
          });

          // 실제 마커 (클릭 이벤트용, 투명)
          var marker = new kakao.maps.Marker({
            position: position,
            map: map,
            opacity: 0
          });

          kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
          });
        });

        // 폴리라인 (경로 표시)
        if (linePath.length > 1) {
          var polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 4,
            strokeColor: '#1344FF',
            strokeOpacity: 0.5,
            strokeStyle: 'dash'
          });
          polyline.setMap(map);
        }

        // 모든 마커가 보이도록 영역 조절
        if (places.length > 1) {
          map.setBounds(bounds);
        } else {
          map.setCenter(new kakao.maps.LatLng(places[0].lat, places[0].lng));
          map.setLevel(3);
        }
      });
    }
  </script>
</body>
</html>`;
  }, [validPlaces]);

  if (validPlaces.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>표시할 장소가 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
});
