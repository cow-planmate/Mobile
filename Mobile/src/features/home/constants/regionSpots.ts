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
 *
 * 사진 출처와 라이선스는 src/assets/images/home/CREDITS.md 참고.
 */
export const REGION_SPOTS: Record<string, RegionSpot[]> = {
  서울: [
    {
      place: '경복궁',
      roman: 'Gyeongbokgung',
      image: require('../../../assets/images/home/seoul-gyeongbokgung.jpg'),
    },
    {
      place: '북촌한옥마을',
      roman: 'Bukchon Hanok Village',
      image: require('../../../assets/images/home/seoul-bukchon.jpg'),
    },
    {
      place: '남산서울타워',
      roman: 'N Seoul Tower',
      image: require('../../../assets/images/home/seoul-namsan.jpg'),
    },
  ],
  부산: [
    {
      place: '해운대해수욕장',
      roman: 'Haeundae Beach',
      image: require('../../../assets/images/home/busan-haeundae.jpg'),
    },
    {
      place: '감천문화마을',
      roman: 'Gamcheon Culture Village',
      image: require('../../../assets/images/home/busan-gamcheon.jpg'),
    },
    {
      place: '광안대교',
      roman: 'Gwangan Bridge',
      image: require('../../../assets/images/home/busan-gwangan.jpg'),
    },
  ],
  제주: [
    {
      place: '성산일출봉',
      roman: 'Seongsan Ilchulbong',
      image: require('../../../assets/images/home/jeju-seongsan.jpg'),
    },
    {
      place: '한라산',
      roman: 'Hallasan',
      image: require('../../../assets/images/home/jeju-hallasan.jpg'),
    },
    {
      place: '협재해수욕장',
      roman: 'Hyeopjae Beach',
      image: require('../../../assets/images/home/jeju-hyeopjae.jpg'),
    },
  ],
  경주: [
    {
      place: '첨성대',
      roman: 'Cheomseongdae',
      image: require('../../../assets/images/home/gyeongju-cheomseongdae.jpg'),
    },
    {
      place: '불국사',
      roman: 'Bulguksa',
      image: require('../../../assets/images/home/gyeongju-bulguksa.jpg'),
    },
    {
      place: '동궁과 월지',
      roman: 'Donggung and Wolji',
      image: require('../../../assets/images/home/gyeongju-wolji.jpg'),
    },
  ],
  전주: [
    {
      place: '전주한옥마을',
      roman: 'Jeonju Hanok Village',
      image: require('../../../assets/images/home/jeonju-hanok.jpg'),
    },
    {
      place: '경기전',
      roman: 'Gyeonggijeon',
      image: require('../../../assets/images/home/jeonju-gyeonggijeon.jpg'),
    },
    {
      place: '오목대',
      roman: 'Omokdae',
      image: require('../../../assets/images/home/jeonju-omokdae.jpg'),
    },
  ],
};

export const MAX_REGION_SPOTS = 5;

export const getRegionSpots = (destination: string): RegionSpot[] => {
  const spots = REGION_SPOTS[destination];
  if (!spots) return [];
  return spots.slice(0, MAX_REGION_SPOTS);
};
