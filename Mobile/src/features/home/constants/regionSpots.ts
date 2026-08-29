import { ImageSourcePropType } from 'react-native';

export type RegionSpot = {
  place: string;
  roman: string;
  image: ImageSourcePropType;
};

/**
 * 여행지별 대표 명소. 키는 `DESTINATIONS_28`의 도시 이름과 같아야 한다.
 * 한 지역당 1~5장을 넣으며, 사진 개수에 따라 히어로 진행바가 자동으로 맞춰진다.
 * 사진이 없는 지역은 키를 비워 두면 화면이 안내 문구로 대체한다.
 */
export const REGION_SPOTS: Record<string, RegionSpot[]> = {
  서울: [
    {
      place: '경복궁',
      roman: 'Gyeongbokgung',
      image: require('../../../assets/images/home/seoul-gyeongbokgung.jpg'),
    },
  ],
  부산: [
    {
      place: '해운대',
      roman: 'Haeundae',
      image: require('../../../assets/images/home/busan-haeundae.jpg'),
    },
  ],
  제주: [
    {
      place: '성산일출봉',
      roman: 'Seongsan Ilchulbong',
      image: require('../../../assets/images/home/jeju-seongsan-ilchulbong.jpg'),
    },
  ],
  경주: [
    {
      place: '첨성대',
      roman: 'Cheomseongdae',
      image: require('../../../assets/images/home/gyeongju-cheomseongdae.jpg'),
    },
  ],
  전주: [
    {
      place: '한옥마을',
      roman: 'Hanok Village',
      image: require('../../../assets/images/home/jeonju-hanok-village.jpg'),
    },
  ],
};

export const MAX_REGION_SPOTS = 5;

export const getRegionSpots = (destination: string): RegionSpot[] => {
  const spots = REGION_SPOTS[destination];
  if (!spots) return [];
  return spots.slice(0, MAX_REGION_SPOTS);
};
