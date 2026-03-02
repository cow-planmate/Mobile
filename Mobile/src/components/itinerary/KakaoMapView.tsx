import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin } from 'lucide-react-native';

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
            yAnchor: 1.3
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

        // 경로 폴리라인 (실선, 반투명)
        if (linePath.length > 1) {
          var polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 3,
            strokeColor: '#1344FF',
            strokeOpacity: 0.35,
            strokeStyle: 'solid'
          });
          polyline.setMap(map);
        }

        // 영역 조절
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
        source={{ html }}
        style={mapStyles.webview}
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
    fontFamily: 'Inter_500Medium',
  },
});
